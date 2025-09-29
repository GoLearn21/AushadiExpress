import { Button } from "./ui/button";

interface SegmentedControlProps {
  segments: Array<{
    value: string;
    label: string;
    icon?: string;
  }>;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SegmentedControl({ segments, value, onChange, className = "" }: SegmentedControlProps) {
  return (
    <div className={`inline-flex bg-muted rounded-lg p-1 ${className}`}>
      {segments.map((segment) => (
        <Button
          key={segment.value}
          variant={value === segment.value ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange(segment.value)}
          className={`rounded-md ${value === segment.value ? 'shadow-sm' : ''}`}
          data-testid={`segment-${segment.value}`}
        >
          {segment.icon && (
            <span className="material-icons text-sm mr-1">{segment.icon}</span>
          )}
          {segment.label}
        </Button>
      ))}
    </div>
  );
}