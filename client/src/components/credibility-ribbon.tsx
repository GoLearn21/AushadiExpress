export function CredibilityRibbon() {
  return (
    <div className="bg-muted/50 border-y border-border px-4 py-2" data-testid="credibility-ribbon">
      <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
        <span className="text-yellow-500">★</span>
        <span className="font-medium">4.8</span>
        <span>(12,345 chemists)</span>
        <span>•</span>
        <span>Trusted since 2025</span>
      </div>
    </div>
  );
}