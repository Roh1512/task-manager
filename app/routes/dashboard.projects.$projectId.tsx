import { useLoaderData } from "@remix-run/react";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import styles from "../Styles/tasksPage.module.css";
import { ErrorComponent } from "~/components/ErrorComponent";

// Dummy tasks data - you should fetch this from your database instead
/* const tasksData: Record<number, string[]> = {
  1: ["Task 1.1", "Task 1.2", "Task 1.3"],
  2: ["Task 2.1", "Task 2.2"],
  3: ["Task 3.1", "Task 3.2", "Task 3.3", "Task 3.4"],
}; */

// Loader to fetch tasks for a specific project
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const projectId = params.projectId;

  /*  // Check if the projectId exists
  if (!tasksData[projectId]) {
    throw new Response("Project not found", { status: 404 });
  }

  const tasks = tasksData[projectId]; */
  return json({ projectId });
};
export default function ProjectTasks() {
  const { projectId } = useLoaderData<typeof loader>();

  return (
    <div className={styles.tasksPage}>
      <h2>Tasks</h2>
      <p>
        <strong>ProjectId: </strong>
        {projectId}
      </p>
    </div>
  );
}

export function ErrorBoundary() {
  return <ErrorComponent />;
}
