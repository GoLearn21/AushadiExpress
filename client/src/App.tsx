import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { PWAInstallPrompt } from "./components/pwa-install-prompt";
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
import CustomerSearchPage from "./pages/customer-search";
import CustomerSearchResultsPage from "./pages/customer-search-results";
import CustomerOrdersPage from "./pages/customer-orders";
import CustomerNearbyStoresPage from "./pages/customer-nearby-stores";
import CustomerStoreProductsPage from "./pages/customer-store-products";
import CustomerCartPage from "./pages/customer-cart";
import CustomerSavedStoresPage from "./pages/customer-saved-stores";
import CustomerSavedOrdersPage from "./pages/customer-saved-orders";
import PharmacyOrdersPage from "./pages/pharmacy-orders";
import ExcelUpload from "./pages/excel-upload";
import WholesalerDashboard from "./pages/wholesaler/dashboard";
import WholesalerProductsPage from "./pages/wholesaler/products";
import WholesalerProductNewPage from "./pages/wholesaler/product-new";
import WholesalerQuotesPage from "./pages/wholesaler/quotes";
import WholesalerOrdersPage from "./pages/wholesaler/orders";
import WholesalerAnalyticsPage from "./pages/wholesaler/analytics";
import WholesalerScanInvoicePage from "./pages/wholesaler/scan-invoice";
import BulkImportPage from "./pages/wholesaler/bulk-import";
import PriceTiersPage from "./pages/wholesaler/price-tiers";
import CreditManagementPage from "./pages/wholesaler/credit-management";
import DeliveryRoutesPage from "./pages/wholesaler/delivery-routes";
import BrowseWholesalersPage from "./pages/retailer/browse-wholesalers";
import WholesalerCatalogPage from "./pages/retailer/wholesaler-catalog";
import MyQuotesPage from "./pages/retailer/my-quotes";
import RetailerQuoteDetailPage from "./pages/retailer/quote-detail";
import MyB2BOrdersPage from "./pages/retailer/my-b2b-orders";
import DoctorDashboard from "./pages/doctor/dashboard";
import DoctorPatientsPage from "./pages/doctor/patients";
import PatientDetailPage from "./pages/doctor/patient-detail";
import AppointmentsPage from "./pages/doctor/appointments";
import PrescriptionsPage from "./pages/doctor/prescriptions";
import PrescriptionNewPage from "./pages/doctor/prescription-new";
import DoctorLabRequestsPage from "./pages/doctor/lab-requests";
import NotFound from "./pages/not-found";
import { SetupGate } from "./components/setup-gate";
import { BottomNavigation } from "./components/bottom-navigation";
import { useAuth } from "./hooks/use-auth";

function Router() {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <SetupGate>
      <div className="flex flex-col h-screen">
        <div className="flex-1 overflow-hidden pb-20">
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
            <Route path="/excel-upload" component={ExcelUpload} />
            <Route path="/ai-assistant" component={AIAssistantPage} />
            <Route path="/search" component={CustomerSearchPage} />
            <Route path="/customer-search" component={CustomerSearchPage} />
            <Route path="/search-results" component={CustomerSearchResultsPage} />
            <Route path="/orders" component={CustomerOrdersPage} />
            <Route path="/nearby-stores" component={CustomerNearbyStoresPage} />
            <Route path="/store/:tenantId/:storeName" component={CustomerStoreProductsPage} />
            <Route path="/cart" component={CustomerCartPage} />
            <Route path="/saved-stores" component={CustomerSavedStoresPage} />
            <Route path="/saved-orders" component={CustomerSavedOrdersPage} />
            <Route path="/pharmacy-orders" component={PharmacyOrdersPage} />
            <Route path="/bill-fast" component={() => <div className="p-4 text-center text-muted-foreground">Bill Fast feature coming in Iteration 1</div>} />
            {/* Wholesaler Routes */}
            <Route path="/wholesaler" component={WholesalerDashboard} />
            <Route path="/wholesaler/products" component={WholesalerProductsPage} />
            <Route path="/wholesaler/products/new" component={WholesalerProductNewPage} />
            <Route path="/wholesaler/quotes" component={WholesalerQuotesPage} />
            <Route path="/wholesaler/orders" component={WholesalerOrdersPage} />
            <Route path="/wholesaler/analytics" component={WholesalerAnalyticsPage} />
            <Route path="/wholesaler/scan-invoice" component={WholesalerScanInvoicePage} />
            <Route path="/wholesaler/ai-assistant" component={AIAssistantPage} />
            <Route path="/wholesaler/bulk-import" component={BulkImportPage} />
            <Route path="/wholesaler/price-tiers" component={PriceTiersPage} />
            <Route path="/wholesaler/credit-management" component={CreditManagementPage} />
            <Route path="/wholesaler/delivery-routes" component={DeliveryRoutesPage} />
            {/* Retailer B2B Routes */}
            <Route path="/retailer/wholesalers" component={BrowseWholesalersPage} />
            <Route path="/retailer/wholesaler/:tenantId" component={WholesalerCatalogPage} />
            <Route path="/retailer/my-quotes" component={MyQuotesPage} />
            <Route path="/retailer/quote/:id" component={RetailerQuoteDetailPage} />
            <Route path="/retailer/my-b2b-orders" component={MyB2BOrdersPage} />
            {/* Doctor Routes */}
            <Route path="/doctor" component={DoctorDashboard} />
            <Route path="/doctor/patients" component={DoctorPatientsPage} />
            <Route path="/doctor/patients/:id" component={PatientDetailPage} />
            <Route path="/doctor/appointments" component={AppointmentsPage} />
            <Route path="/doctor/prescriptions" component={PrescriptionsPage} />
            <Route path="/doctor/prescriptions/new" component={PrescriptionNewPage} />
            <Route path="/doctor/lab-requests" component={DoctorLabRequestsPage} />
            <Route path="/settings" component={Settings} />
            <Route component={NotFound} />
          </Switch>
        </div>
        <BottomNavigation />
      </div>
    </SetupGate>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <PWAInstallPrompt />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
