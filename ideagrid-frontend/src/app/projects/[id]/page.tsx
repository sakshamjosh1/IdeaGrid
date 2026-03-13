"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Sprint = {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  risk_score?: string;
};

type Task = {
  id: number;
  title: string;
  priority: string;
  status: string;
  deadline: string;
  sprint_id: number;
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [tasksMap, setTasksMap] = useState<Record<number, Task[]>>({});
  const [expandedSprint, setExpandedSprint] = useState<number | null>(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/projects/${id}/sprints`)
      .then((res) => res.json())
      .then(setSprints);
  }, [id]);

  const fetchTasks = async (sprintId: number) => {
    if (tasksMap[sprintId]) return; // already loaded

    const res = await fetch(
      `http://127.0.0.1:8000/sprints/${sprintId}/tasks`
    );
    const data = await res.json();

    setTasksMap((prev) => ({
      ...prev,
      [sprintId]: data,
    }));
  };

  const toggleSprint = (sprintId: number) => {
    if (expandedSprint === sprintId) {
      setExpandedSprint(null);
    } else {
      setExpandedSprint(sprintId);
      fetchTasks(sprintId);
    }
  };

  const getRiskColor = (risk?: string) => {
    if (!risk) return "text-gray-500";
    if (risk === "High") return "text-red-600";
    if (risk === "Medium") return "text-yellow-600";
    if (risk === "Low") return "text-green-600";
    return "text-gray-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Project #{id}
          </h1>
          <p className="text-muted-foreground">
            Sprint Overview
          </p>
        </div>

        <Button disabled>Create Sprint</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sprint</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Risk</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {sprints.map((sprint) => (
            <>
              <TableRow key={sprint.id}>
                <TableCell className="font-medium">
                  {sprint.name}
                </TableCell>
                <TableCell>{sprint.start_date}</TableCell>
                <TableCell>{sprint.end_date}</TableCell>
                <TableCell className={getRiskColor(sprint.risk_score)}>
                  {sprint.risk_score}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    onClick={() => toggleSprint(sprint.id)}
                  >
                    {expandedSprint === sprint.id
                      ? "Hide Tasks"
                      : "View Tasks"}
                  </Button>
                </TableCell>
              </TableRow>

              {expandedSprint === sprint.id && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2">
                        Tasks
                      </h3>

                      {tasksMap[sprint.id]?.length ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Title</TableHead>
                              <TableHead>Priority</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Deadline</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {tasksMap[sprint.id].map((task) => (
                              <TableRow key={task.id}>
                                <TableCell>{task.title}</TableCell>
                                <TableCell>{task.priority}</TableCell>
                                <TableCell>{task.status}</TableCell>
                                <TableCell>{task.deadline}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-muted-foreground">
                          No tasks found.
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}