import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, LogOut, Smartphone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Employee, AttendanceRecord } from "@shared/schema";

export default function RecentActivity() {
  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const { data: attendanceRecords = [] } = useQuery<AttendanceRecord[]>({
    queryKey: ["/api/attendance/today"],
  });

  // Create recent activities from attendance records
  const recentActivities = attendanceRecords
    .filter(record => record.checkIn || record.checkOut)
    .sort((a, b) => {
      const aTime = a.checkOut || a.checkIn;
      const bTime = b.checkOut || b.checkIn;
      if (!aTime || !bTime) return 0;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    })
    .slice(0, 3)
    .map(record => {
      const employee = employees.find(e => e.id === record.employeeId);
      const isCheckOut = record.checkOut && new Date(record.checkOut) > new Date(record.checkIn || 0);
      const activityTime = isCheckOut ? record.checkOut : record.checkIn;
      
      return {
        id: record.id,
        employee: employee?.name || 'Unknown Employee',
        type: isCheckOut ? 'checkout' : 'checkin',
        time: activityTime,
      };
    });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'checkin':
        return { icon: LogIn, bgColor: 'bg-green-100', iconColor: 'text-green-600' };
      case 'checkout':
        return { icon: LogOut, bgColor: 'bg-red-100', iconColor: 'text-red-600' };
      default:
        return { icon: Smartphone, bgColor: 'bg-blue-100', iconColor: 'text-blue-600' };
    }
  };

  const formatRelativeTime = (date: Date | string | null) => {
    if (!date) return 'Unknown time';
    
    const now = new Date();
    const activityDate = new Date(date);
    const diffInMs = now.getTime() - activityDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes === 1) return '1 min ago';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInHours === 1) return '1 hr ago';
    if (diffInHours < 24) return `${diffInHours} hr ago`;
    
    return activityDate.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium text-gray-900">
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="flow-root">
          <ul className="-mb-8">
            {recentActivities.length === 0 ? (
              <li className="text-sm text-gray-500 text-center py-4">
                No recent activity
              </li>
            ) : (
              recentActivities.map((activity, index) => {
                const { icon: Icon, bgColor, iconColor } = getActivityIcon(activity.type);
                const isLast = index === recentActivities.length - 1;
                
                return (
                  <li key={activity.id}>
                    <div className={`relative ${!isLast ? 'pb-8' : ''}`}>
                      {!isLast && (
                        <span 
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full ${bgColor} flex items-center justify-center`}>
                            <Icon className={`h-4 w-4 ${iconColor}`} />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-900">
                              <span className="font-medium">{activity.employee}</span>
                              {activity.type === 'checkin' ? ' checked in' : ' checked out'}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <time>{formatRelativeTime(activity.time)}</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
