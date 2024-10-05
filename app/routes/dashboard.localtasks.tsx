import { Task } from "@prisma/client";
import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import { Link, useLoaderData, useNavigation } from "@remix-run/react";
import { AddTaskForm } from "~/components/AddTask";
import { PageLoader } from "~/components/PageLoader";
import { TaskItem } from "~/components/TaskItem";
import { isLoggedIn, requireUserId } from "~/utils/auth.server";
import {
  countTasks,
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
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page")) || 1;
  const take = 5;
  const skip = (page - 1) * take;
  const tasksWithoutProjects = await getTasksWithoutProject(
    request,
    skip,
    take
  );
  const totalTasks = await countTasks(request);
  const totalPages = Math.ceil(Number(totalTasks) / take);

  const hasMore = tasksWithoutProjects.length === take;
  return json({
    localTasks: tasksWithoutProjects,
    page,
    totalPages,
    hasMore,
  });
};

export default function LocalTasks() {
  const { localTasks, page, totalPages, hasMore } =
    useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const loadingState = navigation.state === "loading" && !navigation.formData;
  return (
    <div className="w-full flex flex-col items-center justify-between gap-5 min-h-full p-1">
      {loadingState ? (
        <PageLoader />
      ) : (
        <>
          <div className="w-full flex flex-col items-center justify-center gap-4">
            <AddTaskForm />
            <h1>Local Tasks</h1>
          </div>
          {localTasks.length > 0 ? (
            localTasks.map((task: Task) => (
              <TaskItem key={task.id} task={task} />
            ))
          ) : (
            <p>No tasks to show</p>
          )}
          <div className="flex items-center justify-center w-full gap-4 text-lg pb-4">
            {page > 1 && (
              <Link
                to={`.?page=${page - 1}`}
                className="text-inherit border-2 border-slate-500 px-4 py-1 rounded-xl no-underline "
              >
                Prev
              </Link>
            )}
            {localTasks.length > 0 && (
              <p>
                Page {page} of {totalPages}
              </p>
            )}
            {hasMore && totalPages > page && (
              <Link
                to={`.?page=${page + 1}`}
                className="text-inherit border-2 border-slate-500 px-4 py-1 rounded-xl no-underline"
              >
                Next
              </Link>
            )}
          </div>
        </>
      )}
    </div>
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
