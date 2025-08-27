
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, FileSpreadsheet, FileX, Check } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File) => Promise<void>;
  isLoading: boolean;
  progress: number;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isLoading, progress }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      
      const file = acceptedFiles[0];
      setSelectedFile(file);
      
      try {
        await onFileUpload(file);
        setUploadSuccess(true);
      } catch (error) {
        console.error('File upload failed:', error);
        setUploadSuccess(false);
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
    disabled: isLoading,
  });

  const handleUploadClick = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  };

  React.useEffect(() => {
    setDragActive(isDragActive);
  }, [isDragActive]);

  // Reset success state when file changes
  React.useEffect(() => {
    setUploadSuccess(false);
  }, [selectedFile]);

  return (
    <Card className={`w-full p-6 transition-all duration-300 ${dragActive ? 'ring-2 ring-primary' : ''}`}>
      <div 
        {...getRootProps()} 
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer 
          transition-all duration-200 ease-in-out
          ${dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-fade-in">
            <UploadCloud className="w-8 h-8 text-primary" />
          </div>
          
          <div className="space-y-2 animate-fade-up delay-1">
            <h3 className="font-semibold text-lg">Upload Data File</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Drag and drop your CSV or Excel file here, or click to browse
            </p>
          </div>
          
          <div className="text-xs text-muted-foreground animate-fade-up delay-2">
            Supported formats: .csv, .xlsx, .xls
          </div>
        </div>
      </div>

      {selectedFile && (
        <div className="mt-4 p-4 bg-secondary/50 rounded-lg animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium truncate max-w-[200px] sm:max-w-xs">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {uploadSuccess ? (
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-green-500">
                  <Check className="w-4 h-4" />
                </div>
              ) : (
                <>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setSelectedFile(null)}
                    disabled={isLoading}
                    className="gap-1"
                  >
                    <FileX className="w-4 h-4" />
                    <span className="hidden sm:inline">Remove</span>
                  </Button>
                  
                  <Button 
                    size="sm" 
                    onClick={handleUploadClick} 
                    disabled={isLoading}
                    className="gap-1"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span className="hidden sm:inline">Process</span>
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {isLoading && (
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Processing file...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-1" />
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default FileUpload;
