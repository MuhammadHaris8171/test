import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Settings as SettingsIcon, 
  Wifi, 
  Clock, 
  Bell, 
  Shield,
  Server,
  Download
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [settings, setSettings] = useState({
    workingHours: {
      start: "09:00",
      end: "17:00",
    },
    lateThreshold: "10:00",
    autoRefresh: true,
    notifications: true,
    wifiSsid: "OfficeWiFi",
    scanInterval: 30,
  });

  const { toast } = useToast();

  const handleSave = () => {
    // In a real app, this would save to the backend
    toast({
      title: "Settings Saved",
      description: "Your configuration has been updated successfully.",
    });
  };

  const handleTestConnection = () => {
    // Simulate connection test
    toast({
      title: "Connection Test",
      description: "Wi-Fi connectivity test completed successfully.",
    });
  };

  const handleExportData = () => {
    // Simulate data export
    toast({
      title: "Export Started",
      description: "Your data export has been initiated.",
    });
  };

  return (
    <>
      <Header title="Settings" subtitle="Configure system preferences and options" />
      <div className="p-6 space-y-6">
        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="h-5 w-5 mr-2" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-green-900">Wi-Fi Connection</p>
                  <p className="text-xs text-green-600">Connected to {settings.wifiSsid}</p>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  <Wifi className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-blue-900">Device Scanning</p>
                  <p className="text-xs text-blue-600">Every {settings.scanInterval} seconds</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Data Storage</p>
                  <p className="text-xs text-gray-600">In-memory database</p>
                </div>
                <Badge variant="outline">
                  Running
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Working Hours Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Working Hours & Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="startTime">Work Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={settings.workingHours.start}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    workingHours: { ...prev.workingHours, start: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="endTime">Work End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={settings.workingHours.end}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    workingHours: { ...prev.workingHours, end: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="lateThreshold">Late Arrival Threshold</Label>
                <Input
                  id="lateThreshold"
                  type="time"
                  value={settings.lateThreshold}
                  onChange={(e) => setSettings(prev => ({ ...prev, lateThreshold: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wi-Fi Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wifi className="h-5 w-5 mr-2" />
              Wi-Fi & Network Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="wifiSsid">Office Wi-Fi Network</Label>
                <Input
                  id="wifiSsid"
                  value={settings.wifiSsid}
                  onChange={(e) => setSettings(prev => ({ ...prev, wifiSsid: e.target.value }))}
                  placeholder="Enter Wi-Fi SSID"
                />
              </div>
              <div>
                <Label htmlFor="scanInterval">Scan Interval (seconds)</Label>
                <Input
                  id="scanInterval"
                  type="number"
                  min="10"
                  max="300"
                  value={settings.scanInterval}
                  onChange={(e) => setSettings(prev => ({ ...prev, scanInterval: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            <Button variant="outline" onClick={handleTestConnection}>
              <Wifi className="h-4 w-4 mr-2" />
              Test Wi-Fi Connection
            </Button>
          </CardContent>
        </Card>

        {/* System Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <SettingsIcon className="h-5 w-5 mr-2" />
              System Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Auto-refresh Dashboard</h4>
                <p className="text-sm text-gray-500">Automatically update attendance data every 30 seconds</p>
              </div>
              <Switch
                checked={settings.autoRefresh}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoRefresh: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Enable Notifications</h4>
                <p className="text-sm text-gray-500">Show notifications for attendance events</p>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notifications: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Export All Data</h4>
                <p className="text-sm text-gray-500">Download complete attendance records</p>
              </div>
              <Button variant="outline" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
              <p className="font-medium text-blue-900 mb-1">Data Storage Notice</p>
              <p>This system uses in-memory storage. Data will be lost when the application restarts. For production use, consider implementing persistent database storage.</p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </>
  );
}
