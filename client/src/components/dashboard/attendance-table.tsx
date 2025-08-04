import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronRight } from "lucide-react";
import { Link } from "wouter";
import type { Employee, AttendanceRecord } from "@shared/schema";

interface AttendanceTableProps {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
}

export default function AttendanceTable({ employees, attendanceRecords }: AttendanceTableProps) {
  const getEmployeeRecord = (employeeId: string) => {
    return attendanceRecords.find(record => record.employeeId === employeeId);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      present: "bg-green-100 text-green-800",
      absent: "bg-red-100 text-red-800",
      late: "bg-yellow-100 text-yellow-800",
    };

    const statusDot = {
      present: "bg-green-400",
      absent: "bg-red-400",
      late: "bg-yellow-400",
    };

    return (
      <Badge className={`${variants[status as keyof typeof variants]} inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`}>
        <div className={`w-1.5 h-1.5 ${statusDot[status as keyof typeof statusDot]} rounded-full mr-1`}></div>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatTime = (date: Date | null) => {
    if (!date) return "--";
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Show first 4 employees for dashboard
  const displayEmployees = employees.slice(0, 4);

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-gray-900">
            Current Attendance Status
          </CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Auto-refresh:</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-in
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayEmployees.map((employee) => {
                const record = getEmployeeRecord(employee.id);
                const status = record?.status || 'absent';
                
                return (
                  <tr key={employee.id}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gray-300 text-gray-700 text-sm font-medium">
                            {getInitials(employee.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {employee.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {employee.department}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getStatusBadge(status)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(record?.checkIn || null)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {status === 'absent' ? 'Not Connected' : 'Office Wi-Fi'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {displayEmployees.length} of {employees.length} employees
          </p>
          <Link href="/employees">
            <Button variant="ghost" className="text-sm text-blue-600 hover:text-blue-700 font-medium p-0">
              View all employees
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
