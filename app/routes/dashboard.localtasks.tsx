import { Task } from "@prisma/client";
import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { AddTaskForm } from "~/components/AddTask";
import { TaskItem } from "~/components/TaskItem";
import { isLoggedIn, requireUserId } from "~/utils/auth.server";
import {
  createTask,
  deleteTaskById,
  getTasksWithoutProject,
  markExpired,
  toggleTaskStatus,
} from "~/utils/tasks.server";
import { CreateTaskForm } from "~/utils/types.server";

export const loader: LoaderFunction = async ({ request }) => {
  const loggedIn = await isLoggedIn(request);
  if (!loggedIn) {
    return redirect("/login");
  }
  const tasksWithoutProjects = await getTasksWithoutProject(request);
  return json({ localTasks: tasksWithoutProjects });
};

export default function LocalTasks() {
  const { localTasks } = useLoaderData<typeof loader>();
  return (
    <>
      <AddTaskForm />
      <h1>Local Tasks</h1>
      {localTasks.length > 0 ? (
        localTasks.map((task: Task) => <TaskItem key={task.id} task={task} />)
      ) : (
        <p>No tasks to show</p>
      )}
    </>
  );
}

export const action: ActionFunction = async ({ request }) => {
  try {
    const formData = await request.formData();
    const { _action, ...formValues } = Object.fromEntries(formData);
    const userId = await requireUserId(request);

    switch (_action) {
      case "add_task": {
        console.log("Task values entered: ", formValues);
        const task: CreateTaskForm = {
          userId: userId as string,
          title: formValues.title as string,
          description: formValues.description as string,
          dueDate: formValues.dueDate as string,
          fromDate: formValues.fromDate as string,
          priority: formValues.priority as "LOW" | "MEDIUM" | "HIGH",
        };
        const newTask = await createTask(task);
        console.log("Created Task: ", newTask);

        return json({ newTask });
      }
      case "delete_task": {
        const taskId = formValues.taskId as string;
        const deleteDTask = await deleteTaskById(taskId);
        return json({ deleteDTask });
      }
      case "update_task_expired": {
        const taskId = formValues.taskId as string;
        const updatedTask = await markExpired(taskId);
        return updatedTask;
      }
      case "update_task_status": {
        const taskId = formValues.taskId as string;
        const taskStatus = formValues.taskStatus as
          | "COMPLETE"
          | "IN_PROGRESS"
          | "EXPIRED";
        const updatedTask = await toggleTaskStatus(taskId, taskStatus);
        return updatedTask;
      }
      default: {
        return redirect("/dashboard/localtasks");
      }
    }
  } catch (error) {
    console.error("Unexpected error in local tasks actions", error);
    return json({ error: "An unexpected error occurred" }, { status: 500 });
  }
};
