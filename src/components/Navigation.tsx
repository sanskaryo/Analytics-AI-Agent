import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TableProperties, Home } from 'lucide-react';

export const Navigation = () => {
  return (
    <nav className="flex gap-2">
      <Button variant="ghost" asChild>
        <Link to="/" className="flex items-center gap-2">
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
      </Button>
      <Button variant="ghost" asChild>
        <Link to="/filter" className="flex items-center gap-2">
          <TableProperties className="h-4 w-4" />
          Filter Data
        </Link>
      </Button>
    </nav>
  );
};
