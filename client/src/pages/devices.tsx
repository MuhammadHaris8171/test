import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import DeviceForm from "@/components/forms/device-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Plus, Trash2, Wifi, WifiOff } from "lucide-react";
import type { Device, Employee } from "@shared/schema";

export default function Devices() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: devices = [], isLoading } = useQuery<Device[]>({
    queryKey: ["/api/devices"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const deleteDeviceMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/devices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({
        title: "Success",
        description: "Device deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete device",
        variant: "destructive",
      });
    },
  });

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.name || "Unknown Employee";
  };

  const getEmployeeDepartment = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.department || "Unknown Department";
  };

  const handleDeleteDevice = (id: string) => {
    if (confirm("Are you sure you want to delete this device?")) {
      deleteDeviceMutation.mutate(id);
    }
  };

  const formatLastSeen = (lastSeen: Date | null) => {
    if (!lastSeen) return "Never";
    
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInMs = now.getTime() - lastSeenDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes === 1) return "1 minute ago";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return "1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    return lastSeenDate.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <>
        <Header title="Device Registration" subtitle="Manage registered devices" />
        <div className="p-6">
          <div className="text-center py-8">Loading devices...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Device Registration" subtitle="Manage registered devices" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Registered Devices ({devices.length})
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Monitor device connectivity and manage registrations
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Register Device
          </Button>
        </div>

        {devices.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No devices registered
              </h3>
              <p className="text-gray-500 mb-4">
                Register employee devices to enable automatic attendance tracking.
              </p>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Register Device
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device) => (
              <Card key={device.id}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        device.isConnected ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Smartphone className={`h-5 w-5 ${
                          device.isConnected ? 'text-green-600' : 'text-gray-500'
                        }`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{device.deviceName}</CardTitle>
                        <p className="text-sm text-gray-500">{getEmployeeName(device.employeeId)}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={device.isConnected ? "default" : "secondary"}
                      className={device.isConnected ? "bg-green-100 text-green-800" : ""}
                    >
                      {device.isConnected ? (
                        <>
                          <Wifi className="h-3 w-3 mr-1" />
                          Connected
                        </>
                      ) : (
                        <>
                          <WifiOff className="h-3 w-3 mr-1" />
                          Offline
                        </>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </p>
                      <p className="text-sm text-gray-900">{getEmployeeDepartment(device.employeeId)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        MAC Address
                      </p>
                      <p className="text-sm text-gray-900 font-mono">{device.macAddress}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Seen
                      </p>
                      <p className="text-sm text-gray-900">{formatLastSeen(device.lastSeen)}</p>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDevice(device.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={deleteDeviceMutation.isPending}
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

        <DeviceForm 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
        />
      </div>
    </>
  );
}
