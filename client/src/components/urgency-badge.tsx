export function UrgencyBadge() {
  return (
    <div className="mx-4 mb-4" data-testid="urgency-badge">
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-300 rounded-lg p-3 text-center">
        <div className="flex items-center justify-center space-x-2">
          <span className="text-purple-600 font-semibold">Free 14-day trial</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-destructive font-medium">Ends 30 Sep</span>
          <span className="text-destructive">▶</span>
        </div>
      </div>
    </div>
  );
}