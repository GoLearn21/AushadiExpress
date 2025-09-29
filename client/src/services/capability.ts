export enum DeviceTier {
  VALUE = 'VALUE',
  MAINSTREAM = 'MAINSTREAM', 
  PREMIUM = 'PREMIUM'
}

export interface CapabilityInfo {
  tier: DeviceTier;
  ram: number;
  cores: number;
  hasWebGL: boolean;
  hasCamera: boolean;
  isHighRefreshRate: boolean;
  lastProbed: number;
}

class CapabilityService {
  private static instance: CapabilityService;
  private capabilities: CapabilityInfo | null = null;
  private readonly CACHE_KEY = 'pharma_device_capabilities';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  static getInstance(): CapabilityService {
    if (!CapabilityService.instance) {
      CapabilityService.instance = new CapabilityService();
    }
    return CapabilityService.instance;
  }

  async getCapabilities(): Promise<CapabilityInfo> {
    // Check cache first
    const cached = this.getCachedCapabilities();
    if (cached && this.isCacheValid(cached)) {
      this.capabilities = cached;
      return cached;
    }

    // Probe device capabilities
    const capabilities = await this.probeCapabilities();
    
    // Cache the result
    this.cacheCapabilities(capabilities);
    this.capabilities = capabilities;
    
    return capabilities;
  }

  private async probeCapabilities(): Promise<CapabilityInfo> {
    const ram = this.estimateRAM();
    const cores = this.getCoreCount();
    const hasWebGL = this.detectWebGL();
    const hasCamera = await this.detectCamera();
    const isHighRefreshRate = this.detectHighRefreshRate();

    const tier = this.calculateTier(ram, cores, hasWebGL);

    return {
      tier,
      ram,
      cores,
      hasWebGL,
      hasCamera,
      isHighRefreshRate,
      lastProbed: Date.now()
    };
  }

  private estimateRAM(): number {
    // Use navigator.deviceMemory if available (Chrome/Edge)
    if ('deviceMemory' in navigator) {
      return (navigator as any).deviceMemory;
    }

    // Fallback: estimate based on other factors
    const ua = navigator.userAgent.toLowerCase();
    
    // Mobile devices typically have less RAM
    if (/android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
      // Check for high-end mobile indicators
      if (/iphone.*os 1[5-9]|android.*1[1-9]/i.test(ua)) {
        return 6; // Modern mobile devices
      }
      return 3; // Older mobile devices
    }

    // Desktop/laptop estimation
    const cores = this.getCoreCount();
    if (cores >= 8) return 16;
    if (cores >= 4) return 8;
    return 4;
  }

  private getCoreCount(): number {
    return navigator.hardwareConcurrency || 4;
  }

  private detectWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch {
      return false;
    }
  }

  private async detectCamera(): Promise<boolean> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(device => device.kind === 'videoinput');
    } catch {
      return false;
    }
  }

  private detectHighRefreshRate(): boolean {
    // Check for high refresh rate display
    if ('screen' in window && 'refreshRate' in (window.screen as any)) {
      return (window.screen as any).refreshRate > 60;
    }
    return false;
  }

  private calculateTier(ram: number, cores: number, hasWebGL: boolean): DeviceTier {
    // Premium tier: >=8GB RAM, >=6 cores, WebGL support
    if (ram >= 8 && cores >= 6 && hasWebGL) {
      return DeviceTier.PREMIUM;
    }
    
    // Mainstream tier: >=4GB RAM, >=4 cores
    if (ram >= 4 && cores >= 4) {
      return DeviceTier.MAINSTREAM;
    }
    
    // Value tier: everything else
    return DeviceTier.VALUE;
  }

  private getCachedCapabilities(): CapabilityInfo | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }

  private isCacheValid(capabilities: CapabilityInfo): boolean {
    return Date.now() - capabilities.lastProbed < this.CACHE_DURATION;
  }

  private cacheCapabilities(capabilities: CapabilityInfo): void {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(capabilities));
    } catch {
      // Ignore storage errors
    }
  }

  // Convenience methods
  async getTier(): Promise<DeviceTier> {
    const capabilities = await this.getCapabilities();
    return capabilities.tier;
  }

  async isValueTier(): Promise<boolean> {
    const tier = await this.getTier();
    return tier === DeviceTier.VALUE;
  }

  async isPremiumTier(): Promise<boolean> {
    const tier = await this.getTier();
    return tier === DeviceTier.PREMIUM;
  }

  async hasCamera(): Promise<boolean> {
    const capabilities = await this.getCapabilities();
    return capabilities.hasCamera;
  }

  async getRAM(): Promise<number> {
    const capabilities = await this.getCapabilities();
    return capabilities.ram;
  }
}

// Export singleton instance
export const capabilityService = CapabilityService.getInstance();

// Export constants for easy access
export const Tiers = DeviceTier;