"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Summary = {
  total_projects: number;
  total_sprints: number;
  high_risk_sprints: number;
  medium_risk_sprints: number;
  low_risk_sprints: number;
};

type PriorityItem = {
  priority: string;
  count: number;
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [priorityData, setPriorityData] = useState<PriorityItem[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/dashboard/summary")
      .then((res) => res.json())
      .then(setSummary);

    fetch("http://127.0.0.1:8000/sprints/1/tasks")
      .then((res) => res.json())
      .then((tasks) => {
        const counts: Record<string, number> = {};

        tasks.forEach((task: any) => {
          counts[task.priority] = (counts[task.priority] || 0) + 1;
        });

        const formatted = Object.entries(counts).map(
          ([priority, count]) => ({
            priority,
            count,
          })
        );

        setPriorityData(formatted);
      });
  }, []);

  if (!summary) {
    return <p className="text-muted-foreground">Loading dashboard...</p>;
  }

  const onTrack =
    summary.low_risk_sprints + summary.medium_risk_sprints;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Projects</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {summary.total_projects}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Sprints</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {summary.total_sprints}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>High Risk Sprints</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-red-600">
            {summary.high_risk_sprints}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>On-Track Sprints</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-green-600">
            {onTrack}
          </CardContent>
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
          <CardContent className="flex items-center justify-center h-64">
            <div className="space-y-2 text-center">
              <p className="text-red-600 font-semibold">
                High Risk: {summary.high_risk_sprints}
              </p>
              <p className="text-yellow-600 font-semibold">
                Medium Risk: {summary.medium_risk_sprints}
              </p>
              <p className="text-green-600 font-semibold">
                Low Risk: {summary.low_risk_sprints}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}