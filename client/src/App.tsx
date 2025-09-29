import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import Dashboard from "./pages/dashboard";
import Inventory from "./pages/inventory";
import Sales from "./pages/sales";
import OpsScreen from "./pages/ops";
import EnterPOScreen from "./pages/enter-po";
import SalesLedgerScreen from "./pages/sales-ledger";
import ReturnsScreen from "./pages/returns";
import AdjustStockScreen from "./pages/adjust-stock";
import BarcodeScannerScreen from "./pages/barcode-scan";
import InvoiceScannerScreen from "./pages/scan-invoice";
import QuickCaptureScreen from "./pages/quick-capture";
import Settings from "./pages/settings";
import PosScreen from "./pages/pos";
import ReceiveStockScreen from "./pages/receive-stock";
import ReportsScreen from "./pages/reports";
import AIAssistantPage from "./pages/ai-assistant-fullscreen";
import NotFound from "./pages/not-found";
import { BottomNavigation } from "./components/bottom-navigation";
// import { PermissionPortal } from "@/services/camera"; // Removed - no longer needed

function Router() {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-hidden">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/products" component={Inventory} />
          <Route path="/inventory" component={Inventory} />
          <Route path="/sales" component={Sales} />
          <Route path="/ops" component={OpsScreen} />
          <Route path="/sales-ledger" component={SalesLedgerScreen} />
          <Route path="/returns" component={ReturnsScreen} />
          <Route path="/adjust-stock" component={AdjustStockScreen} />
          <Route path="/barcode-scan" component={BarcodeScannerScreen} />
          <Route path="/scan-invoice" component={InvoiceScannerScreen} />
          <Route path="/capture" component={QuickCaptureScreen} />
          <Route path="/enter-po" component={EnterPOScreen} />
          <Route path="/pos" component={PosScreen} />
          <Route path="/receive-stock" component={ReceiveStockScreen} />
          <Route path="/reports" component={ReportsScreen} />
          <Route path="/ai-assistant" component={AIAssistantPage} />
          <Route path="/bill-fast" component={() => <div className="p-4 text-center text-muted-foreground">Bill Fast feature coming in Iteration 1</div>} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <BottomNavigation />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
