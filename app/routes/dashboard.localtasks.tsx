import { Task } from "@prisma/client";
import { json, LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { AddTaskForm } from "~/components/AddTask";
import { isLoggedIn } from "~/utils/auth.server";
import { getTasksWithoutProject } from "~/utils/tasks.server";

export const loader: LoaderFunction = async ({ request }) => {
  const loggedIn = await isLoggedIn(request);
  if (!loggedIn) {
    return redirect("/login");
  }
  const tasksWithoutProjects = await getTasksWithoutProject(request);
  const localTasks = ["Local Task 1", "Local Task 2", "Local Task 3"];
  return json({ localTasks, localTasksFetched: tasksWithoutProjects });
};

export default function LocalTasks() {
  const { localTasks, localTasksFetched } = useLoaderData<typeof loader>();
  return (
    <>
      <AddTaskForm />
      <h1>Local Tasks</h1>
      {localTasksFetched.length > 0 ? (
        localTasksFetched.map((task: Task) => <p key={task.id}>{task.title}</p>)
      ) : (
        <p>No tasks to show</p>
      )}
      <ul>
        {localTasks.map((task: string, index: number) => (
          <li key={index}>{task}</li>
        ))}
      </ul>
    </>
  );
}
