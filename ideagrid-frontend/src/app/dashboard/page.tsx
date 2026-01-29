"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const priorityData = [
  { priority: "Low", count: 4 },
  { priority: "Medium", count: 6 },
  { priority: "High", count: 3 },
  { priority: "Urgent", count: 1 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Cards  */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Projects</CardTitle>
          </CardHeader>
          <CardContent>5</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Sprints</CardTitle>
          </CardHeader>
          <CardContent>3</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>High Risk Sprints</CardTitle>
          </CardHeader>
          <CardContent>1</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>On-Track Sprints</CardTitle>
          </CardHeader>
          <CardContent>2</CardContent>
        </Card>

      
      </div>
      {/* Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Task Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <XAxis dataKey="priority" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sprint Risk Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
            Risk Engine Coming Soon
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
