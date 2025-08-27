
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Dataset, parseCSV, parseExcel, suggestVisualization, generateSampleQuestions } from '@/lib/dataUtils';

export function useDataProcessing() {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [suggestedVisualizations, setSuggestedVisualizations] = useState<Array<{
    title: string;
    type: string;
    columns: string[];
  }>>([]);
  const [sampleQuestions, setSampleQuestions] = useState<string[]>([]);

  const processFile = async (file: File): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setProgress(10);
    
    try {
      // Validate file type
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      let parsedData: Dataset;
      
      // Parse based on file type
      if (fileExtension === 'csv') {
        setProgress(30);
        parsedData = await parseCSV(file);
      } else if (['xlsx', 'xls'].includes(fileExtension || '')) {
        setProgress(30);
        parsedData = await parseExcel(file);
      } else {
        throw new Error('Unsupported file format. Please upload a CSV or Excel file.');
      }
      
      setProgress(60);
      
      // Generate visualization suggestions
      const suggestions = generateVisualizationSuggestions(parsedData);
      setSuggestedVisualizations(suggestions);
      
      // Generate sample questions
      const questions = generateSampleQuestions(parsedData.info);
      setSampleQuestions(questions);
      
      setProgress(90);
      setDataset(parsedData);
      
      // Success notification
      toast({
        title: 'Data loaded successfully',
        description: `${parsedData.info.rowCount} rows and ${parsedData.info.columns.length} columns detected.`,
      });
      
      setProgress(100);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while processing the file';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error processing file',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to suggest appropriate visualizations based on the dataset
  const generateVisualizationSuggestions = (dataset: Dataset) => {
    const { columns } = dataset.info;
    const suggestions = [];
    
    // Numeric columns for distribution charts
    const numericColumns = columns.filter(col => col.isNumeric);
    if (numericColumns.length > 0) {
      for (const column of numericColumns.slice(0, 2)) { // Limit to first two numeric columns
        const vizType = suggestVisualization([column]);
        suggestions.push({
          title: `Distribution of ${column.name}`,
          type: vizType,
          columns: [column.name]
        });
      }
    }
    
    // Categorical columns for pie/bar charts
    const categoricalColumns = columns.filter(col => 
      !col.isNumeric && col.uniqueValues <= 10 && col.uniqueValues > 1
    );
    if (categoricalColumns.length > 0) {
      for (const column of categoricalColumns.slice(0, 2)) { // Limit to first two categorical columns
        const vizType = suggestVisualization([column]);
        suggestions.push({
          title: `Breakdown of ${column.name}`,
          type: vizType,
          columns: [column.name]
        });
      }
    }
    
    // Correlations between numeric columns
    if (numericColumns.length >= 2) {
      suggestions.push({
        title: `Correlation: ${numericColumns[0].name} vs ${numericColumns[1].name}`,
        type: 'scatter',
        columns: [numericColumns[0].name, numericColumns[1].name]
      });
    }
    
    // Numeric by categorical
    if (numericColumns.length > 0 && categoricalColumns.length > 0) {
      suggestions.push({
        title: `${numericColumns[0].name} by ${categoricalColumns[0].name}`,
        type: 'bar',
        columns: [categoricalColumns[0].name, numericColumns[0].name]
      });
    }
    
    // Time series if date column exists
    const dateColumns = columns.filter(col => col.type === 'date');
    if (dateColumns.length > 0 && numericColumns.length > 0) {
      suggestions.push({
        title: `${numericColumns[0].name} over time`,
        type: 'line',
        columns: [dateColumns[0].name, numericColumns[0].name]
      });
    }
    
    // Always add a table view
    suggestions.push({
      title: 'Data Table',
      type: 'table',
      columns: columns.map(col => col.name)
    });
    
    return suggestions;
  };

  return {
    dataset,
    isLoading,
    error,
    progress,
    processFile,
    suggestedVisualizations,
    sampleQuestions,
  };
}
