import React, { useState, useEffect } from 'react';
import { useDataProcessing } from '@/hooks/useDataProcessing';
import FileUpload from '@/components/FileUpload';
import Dashboard from '@/components/Dashboard';
import ChatInterface from '@/components/ChatInterface';
import { Dataset, DataRow } from '@/lib/dataUtils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { processLLMQuery } from '@/services/llmService';
import { Navigation } from '@/components/Navigation';

interface IndexProps {
  onDataUpload: (dataset: Dataset) => void;
}

const Index: React.FC<IndexProps> = ({ onDataUpload }) => {
  const {
    dataset,
    isLoading,
    error,
    progress,
    processFile,
    suggestedVisualizations,
    sampleQuestions,
  } = useDataProcessing();
  
  const { toast } = useToast();
  const [isProcessingQuery, setIsProcessingQuery] = useState(false);
  const [dynamicVisualizations, setDynamicVisualizations] = useState<Array<{
    title: string;
    type: string;
    columns: string[];
  }>>([]);
  const [filteredData, setFilteredData] = useState<DataRow[] | null>(null);
  
  useEffect(() => {
    if (dataset && suggestedVisualizations?.length > 0) {
      console.log("Dataset loaded with suggested visualizations:", suggestedVisualizations);
    }
  }, [dataset, suggestedVisualizations]);
  
  const handleRunQuery = async (query: string): Promise<string> => {
    if (!dataset) return "Please upload a dataset first.";
  
    setIsProcessingQuery(true);
    console.log("Starting query processing:", query);
  
    try {
      console.log("Calling processLLMQuery with dataset info:", dataset.info);
      const response = await processLLMQuery(query, dataset.info, dataset.data);
      console.log("LLM query response:", response);
  
      // Update visualizations if available
      if (response.visualizations && response.visualizations.length > 0) {
        console.log("Setting dynamic visualizations:", response.visualizations);
        setDynamicVisualizations(response.visualizations);
      } else {
        console.log("No visualizations in response, using default visualizations");
        setDynamicVisualizations([]); // Reset to empty array if no visualizations
      }
      
      // Update filtered data if available
      if (response.filteredData) {
        console.log(`Setting filtered data: ${response.filteredData.length} rows`);
        setFilteredData(response.filteredData);
      } else {
        // Reset to full dataset if no filtering
        setFilteredData(null);
      }
  
      toast({
        title: "Query processed",
        description: "Visualizations updated based on your query.",
      });
  
      setIsProcessingQuery(false);
      return response.text;
    } catch (error) {
      console.error("Error processing query:", error);
      toast({
        variant: "destructive",
        title: "Error processing query",
        description: "Could not process your query. Please try again.",
      });
      setIsProcessingQuery(false);
      return "I'm sorry, I encountered an error processing your query. Please try again.";
    }
  };
  
  const resetDemo = () => {
    window.location.reload();
  };

  const handleFileUpload = async (file: File) => {
    try {
      const dataset = await parseCSV(file);
      onDataUpload(dataset);
      // Navigate to filter page after successful upload
      navigate('/filter');
    } catch (error) {
      console.error('Error parsing CSV:', error);
      // Show error toast or message
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-background overflow-x-hidden">
      <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-sm">
        <div className="container flex h-16 items-center">
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img src="/favicon.svg" alt="DataViz" className="h-6 w-6" />
                <span className="text-xl font-medium">DataViz Console</span>
              </div>
              {dataset && <Navigation />}
            </div>
            
            {dataset && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetDemo}
                className="gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reset</span>
              </Button>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1 py-4 px-4 md:py-8 md:container overflow-x-hidden">
        {!dataset ? (
          <div className="max-w-2xl mx-auto mt-6 md:mt-12">
            <div className="text-center mb-12 space-y-4 fade-in">
              <h1 className="text-4xl font-bold tracking-tight">University Data Visualization</h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Upload your data file to generate insights and interactive visualizations.
              </p>
            </div>
            
            <FileUpload 
              onFileUpload={processFile}
              isLoading={isLoading}
              progress={progress}
            />
            
            {error && (
              <div className="mt-4 p-4 border border-destructive/50 bg-destructive/10 text-destructive rounded-md">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 flex flex-col">
              <Dashboard 
                dataset={{
                  ...dataset,
                  data: filteredData || dataset.data,
                  info: {
                    ...dataset.info,
                    rowCount: filteredData ? filteredData.length : dataset.info.rowCount
                  }
                }}
                visualizations={dynamicVisualizations.length > 0 ? dynamicVisualizations : suggestedVisualizations}
              />
            </div>
            <div className="md:col-span-1 h-[calc(100vh-11rem)] max-h-[calc(100vh-11rem)]">
              <ChatInterface 
                datasetInfo={dataset.info}
                sampleQuestions={sampleQuestions}
                onRunQuery={handleRunQuery}
              />
            </div>
          </div>
        )}
      </main>
      
      <footer className="border-t py-4">
        <div className="container">
          <p className="text-sm text-muted-foreground text-center">
            University Data Dashboard &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
function parseCSV(file: File) {
  throw new Error('Function not implemented.');
}

