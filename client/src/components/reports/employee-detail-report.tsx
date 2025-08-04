import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, AlertTriangle, TrendingUp, Download, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import type { Employee } from "@shared/schema";

interface EmployeeDetailReportProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
}

interface AttendanceDetail {
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  hoursWorked: number;
  isLate: boolean;
  minutesLate: number;
  status: 'present' | 'absent' | 'late';
}

interface EmployeeStats {
  totalDays: number;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  totalHours: number;
  averageHours: number;
  attendanceRate: number;
  punctualityRate: number;
  averageMinutesLate: number;
}

export default function EmployeeDetailReport({ isOpen, onClose, employees }: EmployeeDetailReportProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [dateRange, setDateRange] = useState("30"); // days

  // Generate mock detailed attendance data for the selected employee
  const generateAttendanceData = (employeeId: string): AttendanceDetail[] => {
    if (!employeeId) return [];
    
    const days = parseInt(dateRange);
    const data: AttendanceDetail[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Skip weekends for office attendance
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      const isPresent = Math.random() > 0.1; // 90% attendance rate
      const isLate = isPresent && Math.random() > 0.7; // 30% chance of being late when present
      const minutesLate = isLate ? Math.floor(Math.random() * 60) + 5 : 0;
      
      let checkIn: string | null = null;
      let checkOut: string | null = null;
      let hoursWorked = 0;
      
      if (isPresent) {
        const baseCheckIn = new Date(date);
        baseCheckIn.setHours(9, 0, 0, 0); // 9 AM base time
        baseCheckIn.setMinutes(baseCheckIn.getMinutes() + minutesLate);
        checkIn = baseCheckIn.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
        
        const baseCheckOut = new Date(baseCheckIn);
        baseCheckOut.setHours(baseCheckOut.getHours() + 8 + Math.random() * 2); // 8-10 hours
        checkOut = baseCheckOut.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
        
        hoursWorked = (baseCheckOut.getTime() - baseCheckIn.getTime()) / (1000 * 60 * 60);
      }
      
      data.push({
        date: date.toISOString().split('T')[0],
        checkIn,
        checkOut,
        hoursWorked: Math.round(hoursWorked * 100) / 100,
        isLate,
        minutesLate,
        status: !isPresent ? 'absent' : isLate ? 'late' : 'present'
      });
    }
    
    return data.reverse(); // Most recent first
  };

  const attendanceData = generateAttendanceData(selectedEmployee);
  
  const calculateStats = (data: AttendanceDetail[]): EmployeeStats => {
    const totalDays = data.length;
    const presentDays = data.filter(d => d.status !== 'absent').length;
    const lateDays = data.filter(d => d.isLate).length;
    const absentDays = data.filter(d => d.status === 'absent').length;
    const totalHours = data.reduce((sum, d) => sum + d.hoursWorked, 0);
    const lateEntries = data.filter(d => d.isLate);
    const totalMinutesLate = lateEntries.reduce((sum, d) => sum + d.minutesLate, 0);
    
    return {
      totalDays,
      presentDays,
      lateDays,
      absentDays,
      totalHours: Math.round(totalHours * 100) / 100,
      averageHours: totalDays > 0 ? Math.round((totalHours / presentDays) * 100) / 100 : 0,
      attendanceRate: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
      punctualityRate: presentDays > 0 ? Math.round(((presentDays - lateDays) / presentDays) * 100) : 0,
      averageMinutesLate: lateEntries.length > 0 ? Math.round(totalMinutesLate / lateEntries.length) : 0
    };
  };

  const stats = calculateStats(attendanceData);
  const selectedEmployeeData = employees.find(emp => emp.id === selectedEmployee);

  // Generate chart data for trends
  const chartData = attendanceData.slice(-14).map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    hours: d.hoursWorked,
    late: d.minutesLate
  }));

  const exportReport = () => {
    if (!selectedEmployeeData) return;
    
    const csvContent = [
      ['Employee Detail Report'],
      ['Employee:', selectedEmployeeData.name],
      ['Department:', selectedEmployeeData.department],
      ['Period:', `Last ${dateRange} days`],
      ['Generated:', new Date().toLocaleDateString()],
      [''],
      ['Summary Statistics'],
      ['Total Work Days:', stats.totalDays.toString()],
      ['Days Present:', stats.presentDays.toString()],
      ['Days Late:', stats.lateDays.toString()],
      ['Days Absent:', stats.absentDays.toString()],
      ['Total Hours Worked:', stats.totalHours.toString()],
      ['Average Daily Hours:', stats.averageHours.toString()],
      ['Attendance Rate:', `${stats.attendanceRate}%`],
      ['Punctuality Rate:', `${stats.punctualityRate}%`],
      ['Average Minutes Late:', stats.averageMinutesLate.toString()],
      [''],
      ['Daily Details'],
      ['Date', 'Check In', 'Check Out', 'Hours Worked', 'Status', 'Minutes Late']
    ];
    
    attendanceData.forEach(day => {
      csvContent.push([
        day.date,
        day.checkIn || 'N/A',
        day.checkOut || 'N/A',
        day.hoursWorked.toString(),
        day.status,
        day.minutesLate.toString()
      ]);
    });
    
    const csvString = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedEmployeeData.name.replace(/\s+/g, '_')}_Attendance_Report.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Employee Detail Report
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Employee and Date Range Selection */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Select Employee</label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name} - {employee.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Time Period</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 2 weeks</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="60">Last 2 months</SelectItem>
                  <SelectItem value="90">Last 3 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedEmployee && selectedEmployeeData && (
            <>
              {/* Employee Info Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{selectedEmployeeData.name}</CardTitle>
                      <p className="text-gray-600 dark:text-gray-400">{selectedEmployeeData.department} • {selectedEmployeeData.email}</p>
                    </div>
                    <Button onClick={exportReport} className="flex items-center">
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {/* Statistics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Attendance Rate</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.attendanceRate}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Hours</p>
                        <p className="text-2xl font-bold text-green-600">{stats.totalHours}h</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Days Late</p>
                        <p className="text-2xl font-bold text-yellow-600">{stats.lateDays}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Punctuality</p>
                        <p className="text-2xl font-bold text-purple-600">{stats.punctualityRate}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Hours Worked (Last 14 Days)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="hours" stroke="#10b981" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Late Arrival Patterns</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="late" fill="#f59e0b" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Daily Records */}
              <Card>
                <CardHeader>
                  <CardTitle>Daily Attendance Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {attendanceData.map((day, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="font-medium">
                              {new Date(day.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </div>
                            <Badge variant={
                              day.status === 'absent' ? 'destructive' : 
                              day.status === 'late' ? 'secondary' : 'default'
                            }>
                              {day.status}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm">
                            <span>In: {day.checkIn || 'N/A'}</span>
                            <span>Out: {day.checkOut || 'N/A'}</span>
                            <span className="font-medium">{day.hoursWorked}h</span>
                            {day.isLate && (
                              <span className="text-yellow-600">{day.minutesLate}min late</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Summary Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Summary Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Average Daily Hours:</span>
                      <span className="font-medium ml-2">{stats.averageHours}h</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Average Late Time:</span>
                      <span className="font-medium ml-2">{stats.averageMinutesLate} minutes</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Work Days in Period:</span>
                      <span className="font-medium ml-2">{stats.totalDays}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Days Present:</span>
                      <span className="font-medium ml-2">{stats.presentDays}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Days Absent:</span>
                      <span className="font-medium ml-2">{stats.absentDays}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Late Arrivals:</span>
                      <span className="font-medium ml-2">{stats.lateDays}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}