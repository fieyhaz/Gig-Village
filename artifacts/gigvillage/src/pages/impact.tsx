import { 
  useGetImpactSummary, 
  useGetRecentActivity, 
  useGetGigCategories 
} from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { 
  Users, Briefcase, Banknote, MapPin, 
  TrendingUp, Award, Clock
} from "lucide-react";
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

export default function Impact() {
  const { data: summary, isLoading: isLoadingSummary } = useGetImpactSummary();
  const { data: activities, isLoading: isLoadingActivities } = useGetRecentActivity();
  const { data: categories } = useGetGigCategories();

  // Mock data for chart since backend doesn't provide CategoryCount directly yet
  // Usually this would come from a specific endpoint
  const mockChartData = categories?.map((cat, i) => ({
    name: cat,
    total: Math.floor(Math.random() * 50) + 10,
    earnings: Math.floor(Math.random() * 5000) + 500
  })) || [
    { name: "Cooking/Catering", total: 45, earnings: 4500 },
    { name: "Cleaning", total: 30, earnings: 2100 },
    { name: "Repairs", total: 25, earnings: 3800 },
    { name: "Guiding", total: 15, earnings: 1800 },
    { name: "Handicrafts", total: 20, earnings: 2400 },
  ];

  const colors = ['#8B1A1A', '#C9A84C', '#2E5B3B', '#1E3A8A', '#5A3E36', '#8C5A2B'];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold mb-4 text-primary">Community Impact</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          See the real, measurable difference GigVillage is making in local economies. Transparency and growth, hand in hand.
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { 
            title: "Total Earnings", 
            value: summary ? `RM ${summary.totalEarnings.toLocaleString()}` : "0", 
            icon: Banknote, 
            color: "text-green-600",
            bg: "bg-green-500/10",
            desc: "Generated for local talent"
          },
          { 
            title: "Youth Empowered", 
            value: summary?.youthEmpowered.toString() || "0", 
            icon: Users, 
            color: "text-blue-600",
            bg: "bg-blue-500/10",
            desc: "Registered providers"
          },
          { 
            title: "Gigs Completed", 
            value: summary?.totalBookings.toString() || "0", 
            icon: Briefcase, 
            color: "text-primary",
            bg: "bg-primary/10",
            desc: "Successful matches"
          },
          { 
            title: "Women Participation", 
            value: summary ? `${summary.womenParticipation}%` : "0%", 
            icon: Award, 
            color: "text-secondary",
            bg: "bg-secondary/20",
            desc: "Of total workforce"
          }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-gradient-to-br from-transparent to-muted/50 z-0"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                {isLoadingSummary ? (
                  <Skeleton className="h-10 w-24 mb-2" />
                ) : (
                  <h3 className="text-3xl font-bold mb-1" data-testid={`stat-${stat.title.replace(/\s+/g, '-').toLowerCase()}`}>
                    {stat.value}
                  </h3>
                )}
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-xs text-muted-foreground/80 mt-1">{stat.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <Card className="lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif">Gig Distribution</CardTitle>
            <CardDescription>Breakdown of services across the community</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockChartData} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    dy={10}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={50}>
                    {mockChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Live Activity
            </CardTitle>
            <CardDescription>Recent actions across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingActivities ? (
              <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No recent activity.
              </div>
            ) : (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {activities?.slice(0, 7).map((activity, index) => {
                  let icon;
                  let bg;
                  let color;
                  
                  switch (activity.type) {
                    case "booking":
                      icon = Briefcase;
                      bg = "bg-primary/10";
                      color = "text-primary";
                      break;
                    case "registration":
                      icon = Users;
                      bg = "bg-secondary/20";
                      color = "text-secondary-foreground";
                      break;
                    case "payment":
                      icon = Banknote;
                      bg = "bg-green-500/10";
                      color = "text-green-600";
                      break;
                    default:
                      icon = Award;
                      bg = "bg-blue-500/10";
                      color = "text-blue-600";
                  }

                  const Icon = icon;

                  return (
                    <motion.div 
                      key={activity.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                    >
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-card ${bg} ${color} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 relative left-0 md:left-1/2 -translate-x-1/2`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border/50 bg-card shadow-sm group-hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="text-[10px] uppercase font-bold py-0 h-5">
                            {activity.type}
                          </Badge>
                          <time className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(activity.timestamp), "MMM d")}
                          </time>
                        </div>
                        <p className="text-sm font-medium text-foreground mb-2 leading-tight">
                          {activity.message}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>{activity.location}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
