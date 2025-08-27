import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface DataColumn {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  isNumeric: boolean;
  uniqueValues: number;
  hasNull: boolean;
  min?: number;
  max?: number;
}

export interface DatasetInfo {
  columns: DataColumn[];
  rowCount: number;
  fileName: string;
  fileType: 'csv' | 'excel';
  uploadDate: Date;
}

export interface DataRow {
  [key: string]: any;
}

export type Dataset = {
  data: DataRow[];
  info: DatasetInfo;
};

// Detect column types from data
export const detectColumnTypes = (data: any[]): DataColumn[] => {
  if (!data.length) return [];
  
  const firstRow = data[0];
  const columns: DataColumn[] = [];
  
  // Initialize column info
  for (const key in firstRow) {
    columns.push({
      name: key,
      type: 'string',
      isNumeric: false,
      uniqueValues: new Set().size,
      hasNull: false,
    });
  }
  
  // Analyze all rows to determine types and stats
  data.forEach((row) => {
    columns.forEach((column) => {
      const value = row[column.name];
      
      // Check for null values
      if (value === null || value === undefined || value === '') {
        column.hasNull = true;
        return;
      }
      
      // Detect type
      if (!isNaN(Number(value)) && typeof value !== 'boolean') {
        column.isNumeric = true;
        column.type = 'number';
        
        // Update min/max
        const numValue = Number(value);
        if (column.min === undefined || numValue < column.min) {
          column.min = numValue;
        }
        if (column.max === undefined || numValue > column.max) {
          column.max = numValue;
        }
      } else if (value instanceof Date || !isNaN(Date.parse(value))) {
        column.type = 'date';
      } else if (typeof value === 'boolean' || value === 'true' || value === 'false') {
        column.type = 'boolean';
      }
    });
  });
  
  // Count unique values
  columns.forEach((column) => {
    const uniqueValues = new Set(data.map(row => row[column.name]));
    column.uniqueValues = uniqueValues.size;
  });
  
  return columns;
};

// Parse CSV file
export const parseCSV = (file: File): Promise<Dataset> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        try {
          const data = results.data as DataRow[];
          const columns = detectColumnTypes(data);
          
          const datasetInfo: DatasetInfo = {
            columns,
            rowCount: data.length,
            fileName: file.name,
            fileType: 'csv',
            uploadDate: new Date()
          };
          
          resolve({
            data,
            info: datasetInfo
          });
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

// Parse Excel file
export const parseExcel = (file: File): Promise<Dataset> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as DataRow[];
        const columns = detectColumnTypes(jsonData);
        
        const datasetInfo: DatasetInfo = {
          columns,
          rowCount: jsonData.length,
          fileName: file.name,
          fileType: 'excel',
          uploadDate: new Date()
        };
        
        resolve({
          data: jsonData,
          info: datasetInfo
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading the file'));
    };
    
    reader.readAsBinaryString(file);
  });
};

// Determine the best visualization type for a column or set of columns
export const suggestVisualization = (
  columns: DataColumn[],
  maxCategories = 10
): 'bar' | 'line' | 'pie' | 'scatter' | 'histogram' | 'heatmap' | 'table' => {
  if (columns.length === 1) {
    const column = columns[0];
    
    if (column.isNumeric) {
      // For numeric data with few unique values, bar chart is good
      if (column.uniqueValues <= maxCategories) {
        return 'bar';
      }
      // For numeric data with many values, histogram works better
      return 'histogram';
    } else {
      // For categorical data with few categories, pie chart works
      if (column.uniqueValues <= maxCategories) {
        return 'pie';
      }
      // Otherwise bar chart for categorical with many values
      return 'bar';
    }
  } else if (columns.length === 2) {
    const [col1, col2] = columns;
    
    // Two numeric columns: scatter plot
    if (col1.isNumeric && col2.isNumeric) {
      return 'scatter';
    }
    
    // Time series: if one is date and one is numeric
    if ((col1.type === 'date' && col2.isNumeric) || 
        (col2.type === 'date' && col1.isNumeric)) {
      return 'line';
    }
    
    // One numeric, one categorical with few values: bar chart
    if ((col1.isNumeric && !col2.isNumeric && col2.uniqueValues <= maxCategories) ||
        (col2.isNumeric && !col1.isNumeric && col1.uniqueValues <= maxCategories)) {
      return 'bar';
    }
    
    // Default to table view for complex relationships
    return 'table';
  } else {
    // Multiple columns - heatmap if all numeric, otherwise table
    const allNumeric = columns.every(col => col.isNumeric);
    if (allNumeric && columns.length > 2) {
      return 'heatmap';
    }
    return 'table';
  }
};

// Generate sample questions for the dataset
export const generateSampleQuestions = (info: DatasetInfo): string[] => {
  const questions: string[] = [];
  const numericColumns = info.columns.filter(col => col.isNumeric);
  const categoricalColumns = info.columns.filter(col => !col.isNumeric && col.uniqueValues <= 10);
  const dateColumns = info.columns.filter(col => col.type === 'date');
  
  // Add basic questions
  questions.push(`Show me a summary of the ${info.fileName} dataset`);
  
  // Questions for numeric columns
  if (numericColumns.length > 0) {
    const randomNumCol = numericColumns[Math.floor(Math.random() * numericColumns.length)];
    questions.push(`What's the distribution of ${randomNumCol.name}?`);
    
    if (numericColumns.length > 1) {
      const anotherNumCol = numericColumns.find(col => col.name !== randomNumCol.name);
      if (anotherNumCol) {
        questions.push(`Show the correlation between ${randomNumCol.name} and ${anotherNumCol.name}`);
      }
    }
  }
  
  // Questions for categorical columns
  if (categoricalColumns.length > 0) {
    const randomCatCol = categoricalColumns[Math.floor(Math.random() * categoricalColumns.length)];
    questions.push(`What's the breakdown of ${randomCatCol.name}?`);
    
    if (numericColumns.length > 0) {
      const randomNumCol = numericColumns[Math.floor(Math.random() * numericColumns.length)];
      questions.push(`Compare average ${randomNumCol.name} by ${randomCatCol.name}`);
    }
  }
  
  // Questions for date columns
  if (dateColumns.length > 0 && numericColumns.length > 0) {
    const randomDateCol = dateColumns[Math.floor(Math.random() * dateColumns.length)];
    const randomNumCol = numericColumns[Math.floor(Math.random() * numericColumns.length)];
    questions.push(`Show the trend of ${randomNumCol.name} over ${randomDateCol.name}`);
  }
  
  // Add general analysis questions
  questions.push("What insights can you find in this data?");
  
  return questions;
};

// Function to process and prepare data for specific chart types
export const prepareChartData = (
  data: DataRow[],
  columns: string[],
  chartType: string
) => {
  if (!data.length || !columns.length) return null;
  
  switch (chartType) {
    case 'bar':
    case 'pie': {
      if (columns.length !== 1 && columns.length !== 2) return null;
      
      // If single column, count occurrences of each value
      if (columns.length === 1) {
        const valueMap = new Map();
        data.forEach(row => {
          const value = row[columns[0]];
          valueMap.set(value, (valueMap.get(value) || 0) + 1);
        });
        
        return Array.from(valueMap.entries()).map(([name, value]) => ({
          name: name?.toString() || 'Unknown',
          value
        }));
      }
      
      // If two columns, second column is typically the value
      const [labelCol, valueCol] = columns;
      const aggregated = new Map();
      
      data.forEach(row => {
        const label = row[labelCol];
        const value = parseFloat(row[valueCol]) || 0;
        aggregated.set(label, (aggregated.get(label) || 0) + value);
      });
      
      return Array.from(aggregated.entries()).map(([name, value]) => ({
        name: name?.toString() || 'Unknown',
        value
      }));
    }
    
    case 'line': {
      // Typically used for time series
      if (columns.length !== 2) return null;
      
      const [xCol, yCol] = columns;
      const sortedData = [...data].sort((a, b) => {
        // Convert to dates if possible, otherwise do string comparison
        const aVal = new Date(a[xCol]).getTime();
        const bVal = new Date(b[xCol]).getTime();
        
        return isNaN(aVal) || isNaN(bVal) 
          ? String(a[xCol]).localeCompare(String(b[xCol]))
          : aVal - bVal;
      });
      
      return sortedData.map(row => ({
        name: row[xCol]?.toString() || '',
        value: parseFloat(row[yCol]) || 0
      }));
    }
    
    case 'scatter': {
      if (columns.length !== 2) return null;
      
      const [xCol, yCol] = columns;
      return data.map(row => ({
        x: parseFloat(row[xCol]) || 0,
        y: parseFloat(row[yCol]) || 0,
        name: `${row[xCol]}, ${row[yCol]}`
      }));
    }
    
    default:
      return data;
  }
};

// Simple function to get table headers and rows in a format easy to use in a component
export const prepareTableData = (data: DataRow[]) => {
  if (!data.length) return { headers: [], rows: [] };
  
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(header => row[header]));
  
  return { headers, rows };
};

/**
 * Export data to CSV file
 */
export function exportToCSV(headers: string[], rows: any[], filename: string) {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      row.map(cell => {
        // Handle cells that need to be quoted (contain commas, quotes, or newlines)
        if (cell === null || cell === undefined) {
          return '';
        }
        
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Filter data based on query criteria
 */
export function filterData(data: DataRow[], filterCriteria: Record<string, any>): DataRow[] {
  return data.filter(row => {
    return Object.entries(filterCriteria).every(([key, value]) => {
      // Skip if the key doesn't exist in the row
      if (!(key in row)) return false;
      
      const rowValue = row[key];
      
      // Handle different types of comparisons
      if (typeof value === 'string') {
        // Case-insensitive string comparison
        return String(rowValue).toLowerCase().includes(value.toLowerCase());
      } else if (typeof value === 'number') {
        // Exact numeric comparison
        return rowValue === value;
      } else if (Array.isArray(value)) {
        // Check if the value is in the array
        return value.includes(rowValue);
      } else if (typeof value === 'object' && value !== null) {
        // Handle range queries {min: x, max: y}
        if ('min' in value && 'max' in value) {
          return rowValue >= value.min && rowValue <= value.max;
        }
        // Handle comparison operators {op: '>', val: x}
        if ('op' in value && 'val' in value) {
          switch (value.op) {
            case '>': return rowValue > value.val;
            case '>=': return rowValue >= value.val;
            case '<': return rowValue < value.val;
            case '<=': return rowValue <= value.val;
            case '=': return rowValue === value.val;
            case '!=': return rowValue !== value.val;
            default: return false;
          }
        }
      }
      return false;
    });
  });
}
