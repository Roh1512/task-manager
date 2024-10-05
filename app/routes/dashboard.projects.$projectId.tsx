import {
  useLoaderData,
  useNavigation,
  useOutletContext,
} from "@remix-run/react";
import {
  ActionFunction,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import styles from "../Styles/tasksPage.module.css";
import { ErrorComponent } from "~/components/ErrorComponent";
import { isLoggedIn, requireUserId } from "~/utils/auth.server";
import { PageLoader } from "~/components/PageLoader";
import { editProject, getProjectById } from "~/utils/projects.server";
import { ProjectDetails } from "~/components/ProjectDetails";
// import { Project } from "@prisma/client";
import { CreateTaskForm, ProjectType } from "~/utils/types.server";
import {
  createTask,
  deleteTaskById,
  getTasksByProject,
  markExpired,
  toggleTaskStatus,
} from "~/utils/tasks.server";
import { TaskItem } from "~/components/TaskItem";
import { Task } from "@prisma/client";
import { AddTaskForm } from "~/components/AddTask";

// Dummy tasks data - you should fetch this from your database instead
/* const tasksData: Record<number, string[]> = {
  1: ["Task 1.1", "Task 1.2", "Task 1.3"],
  2: ["Task 2.1", "Task 2.2"],
  3: ["Task 3.1", "Task 3.2", "Task 3.3", "Task 3.4"],
}; */

// Loader to fetch tasks for a specific project
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const loggedIn = await isLoggedIn(request);
  if (!loggedIn) {
    return redirect("/login");
  }
  const projectId = params.projectId;

  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page")) || 1;
  const take = 5;
  const skip = (page - 1) * take;

  const project = await getProjectById(projectId as string);
  if (!project) {
    throw new Response("Project not found", { status: 404 });
  }
  const tasks = await getTasksByProject(
    request,
    skip,
    take,
    projectId as string
  );
  /*  // Check if the projectId exists
  if (!tasksData[projectId]) {
    throw new Response("Project not found", { status: 404 });
  }

  const tasks = tasksData[projectId]; */
  return json({ project, tasks });
};

export default function ProjectTasks() {
  const { project, tasks } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  // Convert date strings back to Date objects
  const parsedTasks = tasks.map((task) => ({
    ...task,
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt),
    dueDate: task.dueDate ? new Date(task.dueDate) : null,
    fromDate: task.fromDate ? new Date(task.fromDate) : null,
  }));
  const {
    setProjects,
  }: { setProjects: React.Dispatch<React.SetStateAction<ProjectType[]>> } =
    useOutletContext();
  console.log(setProjects);

  // const [editProfile, setEditProfile] = useState<boolean>(false);
  const pageLoading = navigation.state === "loading" && !navigation.formData;
  return pageLoading ? (
    <PageLoader />
  ) : (
    <div className="flex flex-col w-full items-center justify-between min-h-full">
      <div className={styles.projectDetails}>
        <ProjectDetails project={project} setProjects={setProjects} />
      </div>
      <div className={styles.tasksPage}>
        <h2>Tasks</h2>
        <AddTaskForm projectId={project.id as string} />
        {parsedTasks.length > 0 ? (
          parsedTasks.map((task: Task) => (
            <TaskItem key={task.id} task={task} />
          ))
        ) : (
          <p>No tasks to show</p>
        )}
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return <ErrorComponent />;
}

export const action: ActionFunction = async ({ request, params }) => {
  try {
    const formData = await request.formData();
    const { _action, ...formValues } = Object.fromEntries(formData);
    const projectId = params.projectId;
    const userId = await requireUserId(request);
    switch (_action) {
      case "edit_project": {
        const editedProject = await editProject(
          projectId!,
          formValues.title as string,
          formValues.description as string
        );
        return json({ editedProject });
      }
      case "add_task": {
        const task: CreateTaskForm = {
          userId: userId as string,
          projectId: formValues.projectId as string,
          title: formValues.title as string,
          description: formValues.description as string,
          dueDate: formValues.dueDate as string,
          fromDate: formValues.fromDate as string,
          priority: formValues.priority as "LOW" | "MEDIUM" | "HIGH",
        };
        const newTask = await createTask(task);
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
        return redirect(`/dashboard/projects/${projectId}`);
      }
    }
  } catch (error) {
    console.error("Unexpected error in project actions", error);
    return json({ error: "An unexpected error occurred" }, { status: 500 });
  }
};
