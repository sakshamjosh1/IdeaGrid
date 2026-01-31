"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Project = {
  id: number;
  name: string;
  description?: string;
  start_date: string;
  end_date?: string;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/projects")
      .then((res) => res.json())
      .then((data) => {
        console.log("Projects from API:", data);
        setProjects(data);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button disabled>New Project</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="font-medium">
                <a href={`/projects/${project.id}`} className="underline">
                  {project.name}
                </a>
              </TableCell>
              <TableCell>{project.start_date}</TableCell>
              <TableCell>{project.end_date ?? "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
  