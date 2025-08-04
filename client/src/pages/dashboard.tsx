import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import StatsCards from "@/components/dashboard/stats-cards";
import AttendanceChart from "@/components/dashboard/attendance-chart";
import AttendanceTable from "@/components/dashboard/attendance-table";
import QuickActions from "@/components/dashboard/quick-actions";
import RecentActivity from "@/components/dashboard/recent-activity";
import LiveStatusIndicator from "@/components/dashboard/live-status-indicator";
import type { Employee, AttendanceRecord } from "@shared/schema";

interface Stats {
  present: number;
  absent: number;
  late: number;
  attendanceRate: number;
}

export default function Dashboard() {
  const { data: stats = { present: 0, absent: 0, late: 0, attendanceRate: 0 } } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const { data: attendanceRecords = [] } = useQuery<AttendanceRecord[]>({
    queryKey: ["/api/attendance/today"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: devices = [] } = useQuery({
    queryKey: ["/api/devices"],
  });

  // Simulate device connectivity changes every 2 minutes
  useEffect(() => {
    const simulateConnectivity = async () => {
      try {
        await apiRequest("POST", "/api/device-connectivity/simulate");
      } catch (error) {
        console.error("Failed to simulate device connectivity:", error);
      }
    };

    const interval = setInterval(simulateConnectivity, 120000); // Every 2 minutes
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Header 
        title="Dashboard" 
        subtitle="Real-time attendance monitoring" 
      />
      <div className="p-6">
        <StatsCards stats={stats} />
        <LiveStatusIndicator 
          connectedDevices={devices.filter((d: any) => d.connected).length}
          totalDevices={devices.length}
          lastUpdate={new Date()}
        />
        <AttendanceChart stats={stats} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AttendanceTable 
            employees={employees} 
            attendanceRecords={attendanceRecords} 
          />
          <div className="space-y-6">
            <QuickActions />
            <RecentActivity />
          </div>
        </div>
      </div>
    </>
  );
}
