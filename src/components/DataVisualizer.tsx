import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatasetInfo, DataRow, prepareChartData, prepareTableData, exportToCSV } from '@/lib/dataUtils';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartBarIcon, ChartPieIcon, LineChartIcon, TableIcon, Download, Maximize2, FileDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import html2canvas from 'html2canvas';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';

interface DataVisualizerProps {
  data: DataRow[];
  info: DatasetInfo;
  visualizations: Array<{
    title: string;
    type: string;
    columns: string[];
  }>;
}

const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#1e40af', '#1d4ed8', '#2563eb', '#0284c7', '#0ea5e9', '#38bdf8'];

const DataVisualizer: React.FC<DataVisualizerProps> = ({ data, info, visualizations }) => {
  const [activeTab, setActiveTab] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(true);
  const [renderedVisualizations, setRenderedVisualizations] = useState<typeof visualizations>([]);
  const chartRef = useRef<HTMLDivElement>(null);
  const [expandedView, setExpandedView] = useState(false);
  const [expandedChartData, setExpandedChartData] = useState<{
    type: string;
    columns: string[];
    title: string;
    index: number;
  } | null>(null);

  // Update renderedVisualizations when visualizations change
  useEffect(() => {
    if (visualizations?.length > 0) {
      console.log("Visualizations updated:", visualizations);
      setRenderedVisualizations(visualizations);
      // Reset to first tab when visualizations change
      setActiveTab('0');
    } else {
      // Set a default table visualization if none provided
      setRenderedVisualizations([{
        title: 'Data Table',
        type: 'table',
        columns: info.columns.map(col => col.name)
      }]);
    }
  }, [visualizations, info.columns]);

  useEffect(() => {
    // Simulate a small delay to show loading skeleton
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleDownload = async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'visualization.png';
      link.click();
    }
  };

  const handleDownloadCSV = () => {
    // Get current visualization
    const currentViz = renderedVisualizations[parseInt(activeTab, 10)];
    
    // Prepare data for export
    const { headers, rows } = prepareTableData(data.slice(0, 5000)); // Export up to 5000 rows
    
    // Create filename based on current viz and dataset
    const filename = `${info.fileName.split('.')[0]}_${currentViz?.title || 'export'}.csv`;
    
    exportToCSV(headers, rows, filename);
  };

  const handleExpand = () => {
    const currentViz = renderedVisualizations[parseInt(activeTab, 10)];
    if (currentViz) {
      setExpandedChartData({
        type: currentViz.type,
        columns: currentViz.columns,
        title: currentViz.title,
        index: parseInt(activeTab, 10)
      });
      setExpandedView(true);
    }
  };

  const renderChart = (type: string, columns: string[], title: string, index: number, isExpanded: boolean = false) => {
    if (!data || data.length === 0) {
      console.log("No data available for visualization");
      return <div className="h-80 flex items-center justify-center">No data available for visualization</div>;
    }

    try {
      console.log(`Preparing chart data for ${type} chart with columns:`, columns);
      const chartData = prepareChartData(data, columns, type);
      
      if (!chartData || chartData.length === 0) {
        console.log("No suitable data for visualization");
        return <div className="h-80 flex items-center justify-center">No suitable data for visualization</div>;
      }
      
      console.log(`Chart data prepared for ${type}:`, chartData);
      
      // Set the height based on whether it's in expanded view or not
      const chartHeight = isExpanded ? "h-full" : "h-80";
      
      switch (type.toLowerCase()) {
        case 'bar':
          return (
            <div className={`${chartHeight} w-full`} ref={chartRef}>
              {chartData && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      tick={{ fontSize: 11 }}
                      height={80}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#3b82f6" name={columns[1] || "Count"}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">No data to display</div>
              )}
            </div>
          );
          
        case 'line':
          return (
            <div className={`${chartHeight} w-full`} ref={chartRef}>
              {chartData && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      tick={{ fontSize: 11 }}
                      height={80}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name={columns[1] || "Value"}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">No data to display</div>
              )}
            </div>
          );
          
        case 'pie':
          return (
            <div className={`${chartHeight} w-full`} ref={chartRef}>
              {chartData && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend layout="vertical" verticalAlign="middle" align="right" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">No data to display</div>
              )}
            </div>
          );
          
        case 'scatter':
          return (
            <div className={`${chartHeight} w-full`} ref={chartRef}>
              {chartData && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid />
                    <XAxis type="number" dataKey="x" name={columns[0]} />
                    <YAxis type="number" dataKey="y" name={columns[1]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend />
                    <Scatter
                      name={`${columns[0]} vs ${columns[1]}`}
                      data={chartData}
                      fill="#3b82f6"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">No data to display</div>
              )}
            </div>
          );
          
        case 'table':
          try {
            // Use more rows in expanded view
            const rowLimit = isExpanded ? 500 : 100;
            const { headers, rows } = prepareTableData(data.slice(0, rowLimit));
            return (
              <div className={`${chartHeight} w-full overflow-auto`} ref={chartRef}>
                <Table>
                  <TableCaption>
                    Showing {Math.min(rowLimit, rows.length)} of {data.length} rows
                  </TableCaption>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      {headers.map((header, i) => (
                        <TableHead key={i}>{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <TableCell key={cellIndex}>
                            {typeof cell === 'object' 
                              ? JSON.stringify(cell)
                              : String(cell ?? '')}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            );
          } catch (error) {
            console.error("Error preparing table data:", error);
            return <div className="h-80 flex items-center justify-center">Error displaying table data</div>;
          }
          
        default:
          console.warn(`Unsupported chart type: ${type}, defaulting to table view`);
          try {
            const { headers, rows } = prepareTableData(data.slice(0, 100));
            return (
              <div className="h-80 w-full overflow-auto" ref={chartRef}>
                <Table>
                  <TableCaption>
                    Showing {Math.min(100, rows.length)} of {data.length} rows
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      {headers.map((header, i) => (
                        <TableHead key={i}>{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <TableCell key={cellIndex}>
                            {typeof cell === 'object' 
                              ? JSON.stringify(cell)
                              : String(cell ?? '')}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            );
          } catch (error) {
            console.error("Error preparing fallback table:", error);
            return <div className="h-80 flex items-center justify-center">Unsupported chart type: {type}</div>;
          }
      }
    } catch (error) {
      console.error(`Error rendering chart of type ${type}:`, error);
      return (
        <div className="h-80 flex items-center justify-center flex-col gap-4">
          <div className="text-destructive">Error rendering visualization</div>
          <Button variant="outline" size="sm" onClick={() => console.log("Chart data for debugging:", { type, columns, data })}>
            Debug Chart
          </Button>
        </div>
      );
    }
  };

  const getChartIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'bar':
        return <ChartBarIcon className="h-4 w-4" />;
      case 'pie':
        return <ChartPieIcon className="h-4 w-4" />;
      case 'line':
        return <LineChartIcon className="h-4 w-4" />;
      case 'table':
        return <TableIcon className="h-4 w-4" />;
      default:
        return <ChartBarIcon className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 w-full">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    );
  }

  return (
    <>
      <Card className="w-full fade-in">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">Data Insights</CardTitle>
              <CardDescription>
                Visualizing {info.rowCount.toLocaleString()} rows from {info.fileName}
              </CardDescription>
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-1" onClick={handleDownloadCSV}>
                <FileDown className="h-4 w-4" />
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
              <Button size="sm" variant="outline" className="gap-1" onClick={handleDownload}>
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Download</span>
              </Button>
              <Button size="sm" variant="outline" className="gap-1" onClick={handleExpand}>
                <Maximize2 className="h-4 w-4" />
                <span className="hidden sm:inline">Expand</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="0" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start mb-4 overflow-auto pb-1 no-scrollbar">
              {renderedVisualizations.map((viz, index) => (
                <TabsTrigger key={index} value={index.toString()} className="flex items-center gap-1">
                  {getChartIcon(viz.type)}
                  <span className="truncate max-w-[180px]">{viz.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {renderedVisualizations.map((viz, index) => (
              <TabsContent key={index} value={index.toString()} className="mt-2 fade-in">
                <div className="bg-white/50 rounded-lg p-2">
                  {renderChart(viz.type, viz.columns, viz.title, index)}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={expandedView} onOpenChange={setExpandedView}>
        <DialogContent className="sm:max-w-[90%] h-[90vh] max-h-[90vh] p-0 flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>{expandedChartData?.title || "Expanded Visualization"}</DialogTitle>
                <DialogDescription>
                  Showing expanded view of {info.fileName}
                </DialogDescription>
              </div>
              <DialogClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>
          
          <div className="flex-grow p-4 overflow-hidden">
            {expandedChartData && (
              <div className="h-full bg-white/50 rounded-lg overflow-auto">
                {renderChart(
                  expandedChartData.type,
                  expandedChartData.columns,
                  expandedChartData.title,
                  expandedChartData.index,
                  true // Pass true to indicate this is expanded view
                )}
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2 p-4">
            <Button variant="outline" size="sm" onClick={handleDownloadCSV}>
              <FileDown className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" />
              Download Image
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DataVisualizer;
