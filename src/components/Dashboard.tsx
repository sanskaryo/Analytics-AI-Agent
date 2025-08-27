import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dataset } from '@/lib/dataUtils';
import DataVisualizer from './DataVisualizer';
import { FileText, TableProperties, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';

interface DashboardProps {
  dataset: Dataset;
  visualizations?: Array<{
    title: string;
    type: string;
    columns: string[];
  }>;
}

const Dashboard: React.FC<DashboardProps> = ({ dataset, visualizations }) => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [dashboardVisualizations, setDashboardVisualizations] = useState<Array<{
    title: string;
    type: string;
    columns: string[];
  }>>([
    {
      title: 'Data Table',
      type: 'table',
      columns: dataset?.info.columns.map(col => col.name) || []
    }
  ]);

  const handleDownload = async () => {
    if (dashboardRef.current) {
      const canvas = await html2canvas(dashboardRef.current);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'visualization.png';
      link.click();
    }
  };

  // Use provided visualizations if available, otherwise use the default ones
  const visToUse = visualizations || dashboardVisualizations;

  if (!dataset) return null;

  const { data, info } = dataset;

  // Extract key stats for the info cards
  const numRows = info.rowCount;
  const numColumns = info.columns.length;
  const numericColumns = info.columns.filter(col => col.isNumeric).length;
  const uploadDate = info.uploadDate;

  return (
    <div className="space-y-6 w-full fade-in" ref={dashboardRef}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoCard
          title="Dataset Size"
          value={`${numRows.toLocaleString()} rows`}
          description={`${numColumns} columns`}
          icon={<FileText className="h-5 w-5" />}
          colorClass="text-blue-600 bg-blue-50"
        />
        
        <InfoCard
          title="Data Types"
          value={`${numericColumns} numeric`}
          description={`${numColumns - numericColumns} categorical`}
          icon={<TableProperties className="h-5 w-5" />}
          colorClass="text-purple-600 bg-purple-50"
        />
        
        <InfoCard
          title="Upload Time"
          value={uploadDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          description={uploadDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          icon={<Clock className="h-5 w-5" />}
          colorClass="text-emerald-600 bg-emerald-50"
        />
      </div>
      
      <DataVisualizer 
        data={data} 
        info={info} 
        visualizations={visToUse} 
      />
    </div>
  );
};

interface InfoCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  colorClass: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, value, description, icon, colorClass }) => (
  <Card className="fade-up">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className={`${colorClass} p-2 rounded-full`}>
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default Dashboard;
