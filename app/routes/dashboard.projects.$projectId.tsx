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
import { isLoggedIn } from "~/utils/auth.server";
import { PageLoader } from "~/components/PageLoader";
import { editProject, getProjectById } from "~/utils/projects.server";
import { ProjectDetails } from "~/components/ProjectDetails";
// import { Project } from "@prisma/client";
import { ProjectType } from "~/utils/types.server";

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

  const project = await getProjectById(projectId as string);
  if (!project) {
    throw new Response("Project not found", { status: 404 });
  }
  /*  // Check if the projectId exists
  if (!tasksData[projectId]) {
    throw new Response("Project not found", { status: 404 });
  }

  const tasks = tasksData[projectId]; */
  return json({ project });
};

export default function ProjectTasks() {
  const { project } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const setProjects: React.Dispatch<React.SetStateAction<ProjectType[]>> =
    useOutletContext();
  console.log(setProjects);

  // const [editProfile, setEditProfile] = useState<boolean>(false);
  const pageLoading = navigation.state === "loading" && !navigation.formData;
  return pageLoading ? (
    <PageLoader />
  ) : (
    <div className={styles.tasksPage}>
      <div>
        <ProjectDetails project={project} setProjects={setProjects} />
      </div>
      <h2>Tasks</h2>
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
    switch (_action) {
      case "edit_project": {
        const editedProject = await editProject(
          projectId!,
          formValues.title as string,
          formValues.description as string
        );
        return json({ editedProject });
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
