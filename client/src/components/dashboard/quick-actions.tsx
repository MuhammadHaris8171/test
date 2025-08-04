import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Smartphone, Download, ChevronRight } from "lucide-react";
import { Link } from "wouter";

export default function QuickActions() {
  const actions = [
    {
      title: "Add Employee",
      icon: UserPlus,
      href: "/employees",
      color: "text-blue-600",
    },
    {
      title: "Register Device",
      icon: Smartphone,
      href: "/devices",
      color: "text-blue-600",
    },
    {
      title: "Export Report",
      icon: Download,
      href: "/reports",
      color: "text-blue-600",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium text-gray-900">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pb-6">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.title} href={action.href}>
              <Button
                variant="ghost"
                className="w-full justify-between p-3 h-auto bg-gray-50 hover:bg-gray-100 text-left"
              >
                <div className="flex items-center">
                  <Icon className={`mr-3 h-5 w-5 ${action.color}`} />
                  <span className="font-medium text-gray-900">{action.title}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Button>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
