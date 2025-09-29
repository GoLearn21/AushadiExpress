import { capabilityService, DeviceTier } from '../capability';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock navigator
const mockNavigator = {
  hardwareConcurrency: 4,
  deviceMemory: 8,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  mediaDevices: {
    enumerateDevices: jest.fn().mockResolvedValue([
      { kind: 'videoinput', deviceId: 'camera1' }
    ])
  }
};

Object.defineProperty(window, 'navigator', {
  value: mockNavigator,
  writable: true
});

// Mock canvas and WebGL
const mockCanvas = {
  getContext: jest.fn().mockReturnValue({})
};

Object.defineProperty(document, 'createElement', {
  value: jest.fn().mockReturnValue(mockCanvas)
});

describe('CapabilityService', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Device Tier Detection', () => {
    it('should detect PREMIUM tier for high-end devices', async () => {
      // Mock high-end device specs
      (navigator as any).deviceMemory = 16;
      (navigator as any).hardwareConcurrency = 8;

      const capabilities = await capabilityService.getCapabilities();
      
      expect(capabilities.tier).toBe(DeviceTier.PREMIUM);
      expect(capabilities.ram).toBe(16);
      expect(capabilities.cores).toBe(8);
    });

    it('should detect MAINSTREAM tier for mid-range devices', async () => {
      // Mock mid-range device specs
      (navigator as any).deviceMemory = 6;
      (navigator as any).hardwareConcurrency = 4;

      const capabilities = await capabilityService.getCapabilities();
      
      expect(capabilities.tier).toBe(DeviceTier.MAINSTREAM);
      expect(capabilities.ram).toBe(6);
      expect(capabilities.cores).toBe(4);
    });

    it('should detect VALUE tier for low-end devices', async () => {
      // Mock low-end device specs
      (navigator as any).deviceMemory = 2;
      (navigator as any).hardwareConcurrency = 2;

      const capabilities = await capabilityService.getCapabilities();
      
      expect(capabilities.tier).toBe(DeviceTier.VALUE);
      expect(capabilities.ram).toBe(2);
      expect(capabilities.cores).toBe(2);
    });

    it('should fallback to estimation when deviceMemory is not available', async () => {
      // Remove deviceMemory
      delete (navigator as any).deviceMemory;
      (navigator as any).hardwareConcurrency = 8;

      const capabilities = await capabilityService.getCapabilities();
      
      expect(capabilities.ram).toBe(16); // Estimated based on cores
      expect(capabilities.tier).toBe(DeviceTier.PREMIUM);
    });
  });

  describe('Camera Detection', () => {
    it('should detect camera availability', async () => {
      const capabilities = await capabilityService.getCapabilities();
      expect(capabilities.hasCamera).toBe(true);
    });

    it('should handle camera detection failure', async () => {
      (navigator.mediaDevices.enumerateDevices as jest.Mock)
        .mockRejectedValue(new Error('Permission denied'));

      const capabilities = await capabilityService.getCapabilities();
      expect(capabilities.hasCamera).toBe(false);
    });
  });

  describe('WebGL Detection', () => {
    it('should detect WebGL support', async () => {
      const capabilities = await capabilityService.getCapabilities();
      expect(capabilities.hasWebGL).toBe(true);
    });

    it('should handle WebGL detection failure', async () => {
      mockCanvas.getContext.mockReturnValue(null);

      const capabilities = await capabilityService.getCapabilities();
      expect(capabilities.hasWebGL).toBe(false);
    });
  });

  describe('Caching', () => {
    it('should cache capabilities in localStorage', async () => {
      await capabilityService.getCapabilities();
      
      const cached = localStorage.getItem('pharma_device_capabilities');
      expect(cached).toBeTruthy();
      
      const parsed = JSON.parse(cached!);
      expect(parsed.tier).toBeDefined();
      expect(parsed.lastProbed).toBeDefined();
    });

    it('should use cached data if still valid', async () => {
      const mockCapabilities = {
        tier: DeviceTier.PREMIUM,
        ram: 16,
        cores: 8,
        hasWebGL: true,
        hasCamera: true,
        isHighRefreshRate: false,
        lastProbed: Date.now()
      };

      localStorage.setItem('pharma_device_capabilities', JSON.stringify(mockCapabilities));

      const capabilities = await capabilityService.getCapabilities();
      expect(capabilities.tier).toBe(DeviceTier.PREMIUM);
    });

    it('should re-probe if cache is expired', async () => {
      const expiredCapabilities = {
        tier: DeviceTier.PREMIUM,
        ram: 16,
        cores: 8,
        hasWebGL: true,
        hasCamera: true,
        isHighRefreshRate: false,
        lastProbed: Date.now() - (25 * 60 * 60 * 1000) // 25 hours ago
      };

      localStorage.setItem('pharma_device_capabilities', JSON.stringify(expiredCapabilities));

      const capabilities = await capabilityService.getCapabilities();
      expect(capabilities.lastProbed).toBeGreaterThan(expiredCapabilities.lastProbed);
    });
  });

  describe('Convenience Methods', () => {
    it('should provide tier checking methods', async () => {
      (navigator as any).deviceMemory = 2;
      (navigator as any).hardwareConcurrency = 2;

      const isValue = await capabilityService.isValueTier();
      const isPremium = await capabilityService.isPremiumTier();
      
      expect(isValue).toBe(true);
      expect(isPremium).toBe(false);
    });

    it('should provide RAM getter', async () => {
      (navigator as any).deviceMemory = 8;

      const ram = await capabilityService.getRAM();
      expect(ram).toBe(8);
    });
  });
});