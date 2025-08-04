import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filters: {
    department?: string;
    status?: string;
    connectionStatus?: string;
  };
  onFilterChange: (filters: any) => void;
  departments: string[];
  className?: string;
}

export default function SearchFilter({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  departments,
  className = "",
}: SearchFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const clearFilter = (key: string) => {
    onFilterChange({ ...filters, [key]: undefined });
  };

  const clearAllFilters = () => {
    onFilterChange({});
  };

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {/* Search Input */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search employees, devices, or departments..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Popover */}
      <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filter
            {activeFilterCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-blue-600 text-white text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filters</h4>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs"
                >
                  Clear all
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {/* Department Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Department
                </label>
                <Select
                  value={filters.department || ""}
                  onValueChange={(value) =>
                    onFilterChange({ ...filters, department: value || undefined })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Employee Status
                </label>
                <Select
                  value={filters.status || ""}
                  onValueChange={(value) =>
                    onFilterChange({ ...filters, status: value || undefined })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Connection Status Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Connection Status
                </label>
                <Select
                  value={filters.connectionStatus || ""}
                  onValueChange={(value) =>
                    onFilterChange({ ...filters, connectionStatus: value || undefined })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All connections" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All connections</SelectItem>
                    <SelectItem value="connected">Connected</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex items-center space-x-2">
          {filters.department && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Dept: {filters.department}</span>
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => clearFilter('department')}
              />
            </Badge>
          )}
          {filters.status && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Status: {filters.status}</span>
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => clearFilter('status')}
              />
            </Badge>
          )}
          {filters.connectionStatus && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Connection: {filters.connectionStatus}</span>
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => clearFilter('connectionStatus')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}