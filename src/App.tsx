import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import NotFound from "./pages/NotFound";
import FilterData from "@/pages/FilterData";
import { useState } from "react";
import { Dataset } from "@/lib/dataUtils";

const queryClient = new QueryClient();

const App = () => {
  const [uploadedData, setUploadedData] = useState<Dataset | null>(null);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <Routes>
            <Route path="/" element={<Index onDataUpload={setUploadedData} />} />
            <Route 
              path="/filter" 
              element={
                uploadedData ? 
                <FilterData data={uploadedData.data} info={uploadedData.info} /> : 
                <div>Please upload a CSV file first</div>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
