import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const projectId = params.id;

  const sprints = [
    {
      id: 1,
      name: "Sprint 1",
      startDate: "2024-01-10",
      endDate: "2024-01-24",
      risk: "Low",
    },
    {
      id: 2,
      name: "Sprint 2",
      startDate: "2024-01-25",
      endDate: "2024-02-08",
      risk: "Coming Soon",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Project #{projectId}
          </h1>
          <p className="text-muted-foreground">
            Active Project
          </p>
        </div>

        <Button disabled>Create Sprint</Button>
      </div>

      {/* Sprint Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sprint</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Risk Score</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {sprints.map((sprint) => (
            <TableRow key={sprint.id}>
              <TableCell className="font-medium">
                {sprint.name}
              </TableCell>
              <TableCell>{sprint.startDate}</TableCell>
              <TableCell>{sprint.endDate}</TableCell>
              <TableCell>{sprint.risk}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
