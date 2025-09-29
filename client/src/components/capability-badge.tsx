import { useState, useEffect } from "react";
import { Badge } from "./ui/badge";
import { capabilityService, DeviceTier } from "../services/capability";

export function CapabilityBadge() {
  const [tier, setTier] = useState<DeviceTier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initTier = async () => {
      try {
        const detectedTier = await capabilityService.getTier();
        setTier(detectedTier);
        
        // Log tier once and store in localStorage
        const hasLogged = localStorage.getItem('capability_tier_logged');
        if (!hasLogged) {
          console.log(`Device capability tier: ${detectedTier}`);
          localStorage.setItem('capability_tier_logged', 'true');
          localStorage.setItem('device_tier', detectedTier);
        }
      } catch (error) {
        console.error('Failed to detect device tier:', error);
        setTier(DeviceTier.VALUE); // Fallback
      } finally {
        setLoading(false);
      }
    };

    initTier();
  }, []);

  if (loading || !tier) {
    return null;
  }

  const getTierColor = (tier: DeviceTier) => {
    switch (tier) {
      case DeviceTier.PREMIUM:
        return "bg-purple-100 text-purple-800 border-purple-200";
      case DeviceTier.MAINSTREAM:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case DeviceTier.VALUE:
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTierIcon = (tier: DeviceTier) => {
    switch (tier) {
      case DeviceTier.PREMIUM:
        return "diamond";
      case DeviceTier.MAINSTREAM:
        return "star";
      case DeviceTier.VALUE:
        return "circle";
      default:
        return "circle";
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={`${getTierColor(tier)} text-xs flex items-center space-x-1`}
      data-testid="capability-badge"
    >
      <span className="material-icons text-xs">{getTierIcon(tier)}</span>
      <span>{tier}</span>
    </Badge>
  );
}