import { useLocation } from "wouter";
import { tw } from "../lib/theme";

export default function AdjustStockScreen() {
  const [, navigate] = useLocation();

  return (
    <div className="h-screen overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate('/ops')}
              className="text-muted-foreground hover:text-foreground"
              data-testid="back-to-ops"
            >
              <span className="material-icons">arrow_back</span>
            </button>
            <h1 className={`${tw.headingXl}`} data-testid="adjust-stock-title">Adjust Stock</h1>
          </div>
          <div className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
            COMING SOON
          </div>
        </div>

        {/* Placeholder Content */}
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <span className="material-icons text-4xl text-green-600">edit</span>
          </div>
          <h2 className={`${tw.headingLg} mb-3`}>Stock Adjustments</h2>
          <p className={`${tw.body} text-muted-foreground max-w-md mb-6`}>
            Manually adjust inventory levels, handle damaged goods, and maintain accurate stock counts with audit trails.
          </p>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg max-w-md">
            <h3 className="font-semibold text-sm mb-2">Coming in Iteration 2</h3>
            <ul className="text-xs text-muted-foreground space-y-1 text-left">
              <li>• Manual stock adjustments</li>
              <li>• Damage and expiry handling</li>
              <li>• Audit trail tracking</li>
              <li>• Batch adjustment tools</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}