import { useState, useEffect } from "react";
import { Wifi, WifiOff, Activity, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LiveStatusIndicatorProps {
  connectedDevices: number;
  totalDevices: number;
  lastUpdate: Date;
}

export default function LiveStatusIndicator({ 
  connectedDevices, 
  totalDevices, 
  lastUpdate 
}: LiveStatusIndicatorProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getTimeSinceUpdate = () => {
    const diffInSeconds = Math.floor((currentTime.getTime() - lastUpdate.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  const connectionPercentage = totalDevices > 0 ? Math.round((connectedDevices / totalDevices) * 100) : 0;
  const isHealthy = connectionPercentage >= 70;

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isHealthy ? 'bg-green-100 dark:bg-green-900' : 'bg-yellow-100 dark:bg-yellow-900'
            }`}>
              {isHealthy ? (
                <Wifi className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <WifiOff className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                Network Status
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {connectedDevices} of {totalDevices} devices connected
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <Badge 
              variant={isHealthy ? "default" : "secondary"}
              className={isHealthy ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : ""}
            >
              {connectionPercentage}% Online
            </Badge>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Updated {getTimeSinceUpdate()}
            </p>
          </div>
        </div>
        
        <div className="mt-3">
          <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-300">
            <Activity className="h-3 w-3" />
            <span>Live monitoring active</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}