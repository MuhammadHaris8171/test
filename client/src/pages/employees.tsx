import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import EmployeeForm from "@/components/forms/employee-form";
import BulkEmployeeImport from "@/components/forms/bulk-employee-import";
import EmployeeScheduleForm from "@/components/forms/employee-schedule-form";
import SearchFilter from "@/components/ui/search-filter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Mail, Trash2, Upload, Calendar } from "lucide-react";
import type { Employee } from "@shared/schema";

export default function Employees() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<{
    department?: string;
    status?: string;
  }>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  // Get unique departments for filter options
  const departments = useMemo(() => {
    return Array.from(new Set(employees.map(emp => emp.department)));
  }, [employees]);

  // Filter and search employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!employee.name.toLowerCase().includes(searchLower) &&
            !employee.email.toLowerCase().includes(searchLower) &&
            !employee.department.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Department filter
      if (filters.department && employee.department !== filters.department) {
        return false;
      }

      // Status filter
      if (filters.status) {
        const isActive = employee.isActive;
        if (filters.status === 'active' && !isActive) return false;
        if (filters.status === 'inactive' && isActive) return false;
      }

      return true;
    });
  }, [employees, searchTerm, filters]);

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/employees/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete employee",
        variant: "destructive",
      });
    },
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getWorkingDays = (workSchedule: any) => {
    if (!workSchedule) return 0;
    return Object.values(workSchedule).filter((day: any) => day?.enabled).length;
  };

  const handleOpenSchedule = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsScheduleFormOpen(true);
  };

  const handleDeleteEmployee = (id: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      deleteEmployeeMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header title="Employees" subtitle="Manage employee information" />
        <div className="p-6">
          <div className="text-center py-8">Loading employees...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Employees" subtitle="Manage employee information" />
      <div className="p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                All Employees ({filteredEmployees.length} of {employees.length})
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage employee profiles and access
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsBulkImportOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Bulk Import
              </Button>
              <Button onClick={() => setIsFormOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </div>
          </div>

          {/* Search and Filter */}
          <SearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filters}
            onFilterChange={setFilters}
            departments={departments}
          />
        </div>

        {filteredEmployees.length === 0 ? (
          employees.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No employees found
              </h3>
              <p className="text-gray-500 mb-4">
                Get started by adding your first employee.
              </p>
              <Button onClick={() => setIsFormOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </CardContent>
          </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No employees match your search
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your search term or filters.
                </p>
              </CardContent>
            </Card>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map((employee) => (
              <Card key={employee.id}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                          {getInitials(employee.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{employee.name}</CardTitle>
                        <p className="text-sm text-gray-500">{employee.department}</p>
                      </div>
                    </div>
                    <Badge variant={employee.isActive ? "default" : "secondary"}>
                      {employee.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {employee.email}
                    </div>
                    {/* Work Schedule Info */}
                    {employee.workSchedule && (
                      <div className="text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {getWorkingDays(employee.workSchedule)} days/week
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenSchedule(employee)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEmployee(employee.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={deleteEmployeeMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <EmployeeForm 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
        />
        <BulkEmployeeImport 
          isOpen={isBulkImportOpen} 
          onClose={() => setIsBulkImportOpen(false)} 
        />

        <EmployeeScheduleForm
          isOpen={isScheduleFormOpen}
          onClose={() => {
            setIsScheduleFormOpen(false);
            setSelectedEmployee(null);
          }}
          employee={selectedEmployee}
        />
      </div>
    </>
  );
}
