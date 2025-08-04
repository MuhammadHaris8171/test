import { UserCheck, UserX, Clock, Percent } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  stats: {
    present: number;
    absent: number;
    late: number;
    attendanceRate: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Present Today",
      value: stats.present,
      icon: UserCheck,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Absent Today",
      value: stats.absent,
      icon: UserX,
      bgColor: "bg-red-100",
      iconColor: "text-red-600",
    },
    {
      title: "Late Arrivals",
      value: stats.late,
      icon: Clock,
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      title: "Attendance Rate",
      value: `${stats.attendanceRate}%`,
      icon: Percent,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${card.iconColor}`} />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.title}
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {card.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
