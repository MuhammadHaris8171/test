import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Users, 
  Smartphone, 
  BarChart3, 
  Settings, 
  Watch,
  LayoutDashboard 
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Employees", href: "/employees", icon: Users },
  { name: "Device Registration", href: "/devices", icon: Smartphone },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 shadow-lg border-r border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
            <Watch className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">OfficeTrack</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Attendance System</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        <div className="px-3">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <li key={item.name}>
                  <Link href={item.href}>
                    <div
                      className={cn(
                        "group flex items-center px-3 py-2 text-sm font-medium rounded-l-md transition-colors cursor-pointer",
                        isActive
                          ? "bg-blue-50 dark:bg-blue-900/50 border-r-2 border-blue-600 text-blue-700 dark:text-blue-300"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                      )}
                    >
                      <Icon 
                        className={cn(
                          "mr-3 h-5 w-5",
                          isActive 
                            ? "text-blue-600" 
                            : "text-gray-400 group-hover:text-gray-500"
                        )} 
                      />
                      {item.name}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
