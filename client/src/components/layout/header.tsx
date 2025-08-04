import { Clock, Wifi } from "lucide-react";
import { useState, useEffect } from "react";
import NotificationCenter from "./notification-center";
import ThemeToggle from "./theme-toggle";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{title}</h2>
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Wi-Fi Connected</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <Clock className="h-4 w-4" />
              <span>{timeString}</span>
            </div>
            <NotificationCenter />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
