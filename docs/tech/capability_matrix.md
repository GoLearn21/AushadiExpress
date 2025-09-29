# Device Capability Matrix

This document outlines the device tier classification system and corresponding feature availability in Pharma-Empire OS.

## Tier Classification

### VALUE Tier
**Hardware Requirements:**
- RAM: < 4GB
- CPU Cores: < 4 cores
- WebGL: Not required

**Target Devices:**
- Entry-level smartphones (2-3GB RAM)
- Basic tablets
- Older devices (3+ years)

**Features Enabled:**
- ✅ Basic POS functionality
- ✅ Manual product entry
- ✅ Single-frame barcode capture
- ✅ Cash payments
- ✅ Offline inventory management
- ❌ Continuous barcode scanning
- ❌ Real-time camera preview animations
- ❌ Advanced UI animations

### MAINSTREAM Tier
**Hardware Requirements:**
- RAM: 4-7GB
- CPU Cores: 4-5 cores
- WebGL: Preferred

**Target Devices:**
- Mid-range smartphones (4-6GB RAM)
- Standard tablets
- Modern devices (1-3 years)

**Features Enabled:**
- ✅ All VALUE tier features
- ✅ Continuous barcode scanning
- ✅ 1080p camera preview
- ✅ UPI Lite payments
- ✅ Basic UI animations
- ✅ Real-time stock updates
- ❌ Advanced AI features

### PREMIUM Tier
**Hardware Requirements:**
- RAM: ≥ 8GB
- CPU Cores: ≥ 6 cores
- WebGL: Required

**Target Devices:**
- High-end smartphones (8GB+ RAM)
- Premium tablets
- Latest flagship devices

**Features Enabled:**
- ✅ All MAINSTREAM tier features
- ✅ Advanced UI animations
- ✅ High refresh rate support
- ✅ AI-powered inventory suggestions
- ✅ OCR receipt scanning (future)
- ✅ Voice commands (future)
- ✅ Advanced analytics

## Performance Targets

| Tier | Cold Start | Scan Speed | Bill Generation |
|------|-----------|------------|-----------------|
| VALUE | ≤ 6s | Single capture | ≤ 15s |
| MAINSTREAM | ≤ 4s | 2-3 fps | ≤ 10s |
| PREMIUM | ≤ 3s | 5+ fps | ≤ 5s |

## Feature Detection

```typescript
import { capabilityService, DeviceTier } from '@/services/capability';

const tier = await capabilityService.getTier();

if (tier === DeviceTier.VALUE) {
  // Enable single-frame capture mode
  enableSimpleScanning();
} else {
  // Enable continuous scanning
  enableAdvancedScanning();
}
```

## Progressive Enhancement

The system automatically detects device capabilities and enables features accordingly:

1. **Runtime Detection**: Device specs are probed on first launch
2. **Caching**: Results are cached for 24 hours to avoid repeated probing
3. **Graceful Degradation**: Higher-tier features fail silently on lower-tier devices
4. **User Preference**: Users can manually override tier detection in settings

## Bundle Splitting Strategy

- **Core Bundle**: Essential POS functionality (all tiers)
- **Enhanced Bundle**: Camera and scanning features (MAINSTREAM+)
- **Premium Bundle**: AI and advanced features (PREMIUM only)

Dynamic imports ensure only necessary code is loaded:

```typescript
if (await capabilityService.isPremiumTier()) {
  const { AIAssistant } = await import('@/features/ai-assistant');
  // Load premium features
}
```