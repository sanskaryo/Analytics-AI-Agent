import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileDown, X } from 'lucide-react';
import { DataRow, DatasetInfo, exportToCSV } from '@/lib/dataUtils';

interface FilterDataProps {
  data: DataRow[];
  info: DatasetInfo;
}

type FilterCondition = {
  column: string;
  operator: string;
  value: string;
};

const OPERATORS = {
  text: ['contains', 'not contains', 'equals', 'not equals', 'starts with', 'ends with'],
  number: ['equals', 'not equals', 'greater than', 'less than', 'between', 'top', 'bottom'],
  date: ['equals', 'before', 'after', 'between']
};

const FilterData: React.FC<FilterDataProps> = ({ data, info }) => {
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState('');

  const addFilter = () => {
    setFilters([...filters, { column: info.columns[0].name, operator: 'contains', value: '' }]);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, field: keyof FilterCondition, value: string) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], [field]: value };
    setFilters(newFilters);
  };

  const getColumnType = (columnName: string) => {
    const column = info.columns.find(col => col.name === columnName);
    return column?.isNumeric ? 'number' : column?.type || 'text';
  };

  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search filter
    if (searchText) {
      result = result.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }

    // Apply advanced filters
    filters.forEach(filter => {
      result = result.filter(row => {
        const value = row[filter.column];
        const filterValue = filter.value;

        switch (filter.operator) {
          case 'contains':
            return String(value).toLowerCase().includes(filterValue.toLowerCase());
          case 'not contains':
            return !String(value).toLowerCase().includes(filterValue.toLowerCase());
          case 'equals':
            return String(value) === filterValue;
          case 'not equals':
            return String(value) !== filterValue;
          case 'starts with':
            return String(value).toLowerCase().startsWith(filterValue.toLowerCase());
          case 'ends with':
            return String(value).toLowerCase().endsWith(filterValue.toLowerCase());
          case 'greater than':
            return Number(value) > Number(filterValue);
          case 'less than':
            return Number(value) < Number(filterValue);
          case 'between':
            const [min, max] = filterValue.split(',').map(Number);
            return Number(value) >= min && Number(value) <= max;
          case 'top':
            // Implementation for top N values
            return true; // This needs more complex logic
          case 'bottom':
            // Implementation for bottom N values
            return true; // This needs more complex logic
          default:
            return true;
        }
      });
    });

    return result;
  }, [data, filters, searchText]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleDownloadCSV = () => {
    const headers = info.columns.map(col => col.name);
    const rows = filteredData.map(row => headers.map(header => row[header]));
    exportToCSV(headers, rows, `filtered_data_${new Date().toISOString()}.csv`);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-bold">Filter Data</CardTitle>
        <Button onClick={handleDownloadCSV} variant="outline" className="gap-2">
          <FileDown className="h-4 w-4" />
          Export CSV
        </Button>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex flex-col space-y-4">
            <Input
              placeholder="Search all columns..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="max-w-sm"
            />

            <div className="flex flex-wrap gap-2">
              {filters.map((filter, index) => (
                <Badge key={index} variant="secondary" className="p-2">
                  <div className="flex items-center gap-2">
                    <Select
                      value={filter.column}
                      onValueChange={(value) => updateFilter(index, 'column', value)}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue>{filter.column}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {info.columns.map(col => (
                          <SelectItem key={col.name} value={col.name}>
                            {col.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={filter.operator}
                      onValueChange={(value) => updateFilter(index, 'operator', value)}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue>{filter.operator}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {OPERATORS[getColumnType(filter.column)].map(op => (
                          <SelectItem key={op} value={op}>
                            {op}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      placeholder="Value"
                      value={filter.value}
                      onChange={(e) => updateFilter(index, 'value', e.target.value)}
                      className="w-[120px]"
                    />

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFilter(index)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Badge>
              ))}
              <Button variant="outline" size="sm" onClick={addFilter}>
                Add Filter
              </Button>
            </div>
          </div>

          {/* Results Info */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Showing {paginatedData.length} of {filteredData.length} results
            </p>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => setPageSize(Number(value))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue>{pageSize} rows</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size} rows
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {info.columns.map(column => (
                    <TableHead key={column.name}>{column.name}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {info.columns.map(column => (
                      <TableCell key={column.name}>
                        {String(row[column.name] ?? '')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage * pageSize >= filteredData.length}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterData;
