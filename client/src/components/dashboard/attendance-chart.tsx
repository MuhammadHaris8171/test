import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface AttendanceChartProps {
  stats: {
    present: number;
    absent: number;
    late: number;
    attendanceRate: number;
  };
}

export default function AttendanceChart({ stats }: AttendanceChartProps) {
  const weeklyData = [
    { day: 'Mon', present: 8, absent: 2, late: 1 },
    { day: 'Tue', present: 9, absent: 1, late: 2 },
    { day: 'Wed', present: 7, absent: 3, late: 1 },
    { day: 'Thu', present: 10, absent: 0, late: 1 },
    { day: 'Fri', present: stats.present, absent: stats.absent, late: stats.late },
  ];

  const pieData = [
    { name: 'Present', value: stats.present, color: '#10b981' },
    { name: 'Absent', value: stats.absent, color: '#ef4444' },
    { name: 'Late', value: stats.late, color: '#f59e0b' },
  ];

  const totalEmployees = stats.present + stats.absent + stats.late;
  const attendanceRate = totalEmployees > 0 ? Math.round((stats.present / totalEmployees) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Weekly Attendance Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Weekly Attendance Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="present" fill="#10b981" name="Present" />
              <Bar dataKey="late" fill="#f59e0b" name="Late" />
              <Bar dataKey="absent" fill="#ef4444" name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Today's Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-green-600" />
            Today's Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx={100}
                    cy={100}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {attendanceRate}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Attendance Rate
                </div>
              </div>
              <div className="space-y-2">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}