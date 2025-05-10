import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "@/context/DataContext";
import Index from "./pages/Index";
import QualityControlPage from "./pages/QualityControlPage";
import CuttingManagementPage from "./pages/CuttingManagementPage";
import StitchingProcessPage from "./pages/StitchingProcessPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import NotFound from "./pages/NotFound";
import Navbar from "@/components/layout/Navbar"; // Import Navbar

// Layout wrapper to apply global background and shared UI (like sidebar)
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex">
      <Navbar /> {/* Place Navbar on the left */}
      <main className="flex-1 ml-64 p-6">{children}</main> {/* Main content area */}
    </div>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DataProvider>
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/quality-control" element={<QualityControlPage />} />
              <Route path="/cutting-management" element={<CuttingManagementPage />} />
              <Route path="/stitching-process" element={<StitchingProcessPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </DataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
