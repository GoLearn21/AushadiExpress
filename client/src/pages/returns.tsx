import { useLocation } from "wouter";
import { tw } from "../lib/theme";

export default function ReturnsScreen() {
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
            <h1 className={`${tw.headingXl}`} data-testid="returns-title">Returns</h1>
          </div>
          <div className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
            COMING SOON
          </div>
        </div>

        {/* Placeholder Content */}
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <span className="material-icons text-4xl text-blue-600">u_turn_left</span>
          </div>
          <h2 className={`${tw.headingLg} mb-3`}>Returns Management</h2>
          <p className={`${tw.body} text-muted-foreground max-w-md mb-6`}>
            Handle customer returns, process refunds, and manage return inventory with automated workflows.
          </p>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg max-w-md">
            <h3 className="font-semibold text-sm mb-2">Coming in Iteration 2</h3>
            <ul className="text-xs text-muted-foreground space-y-1 text-left">
              <li>• Scan return receipts</li>
              <li>• Process customer refunds</li>
              <li>• Track returned inventory</li>
              <li>• Generate return reports</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}