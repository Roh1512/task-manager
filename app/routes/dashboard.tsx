import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import { isLoggedIn, requireUserId } from "~/utils/auth.server";
import styles from "../Styles/dashboard.module.css";
import { useEffect, useRef, useState } from "react";
import {
  Form,
  Link,
  NavLink,
  Outlet,
  useActionData,
  useFetcher,
  useLoaderData,
  useLocation,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { CreateProjectForm, ProjectType } from "~/utils/types.server";
import {
  createProject,
  deleteProject,
  getProjectsByUser,
} from "~/utils/projects.server";
import { ProjectListElement } from "~/components/ProjectListElement";
// import { Project } from "@prisma/client";
import { ButtonLoader } from "~/components/ButtonLoader";
import { PageLoader } from "~/components/PageLoader";

export const loader: LoaderFunction = async ({ request }) => {
  const loggedIn = await isLoggedIn(request);
  if (!loggedIn) {
    return redirect("/");
  }
  const userId = await requireUserId(request);
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page")) || 1;
  const take = 5;
  const skip = (page - 1) * take;
  const projects = await getProjectsByUser(userId, skip, take);

  return { projects, page, hasMore: projects.length === take };
};

export const action: ActionFunction = async ({ request }) => {
  try {
    const formData = await request.formData();
    const { _action, ...formValues } = Object.fromEntries(formData);

    const userId = await requireUserId(request);
    switch (_action) {
      case "create_project": {
        console.log(formValues);

        const project: CreateProjectForm = {
          title: formValues.title as string,
          description: (formValues?.description as string) || undefined,
          userId: userId as string,
        };
        const newProject = await createProject(project);
        console.log("Created project: ", newProject);
        return json({ newProject });
      }
      case "delete_project": {
        const projectId = formValues.projectId as string;
        console.log("ProjectId: ", projectId);
        console.log(formValues);
        const deletedProject = await deleteProject(projectId);
        console.log("Project Deleted Successfully from action", deletedProject);
        console.log("Deleted projectID: ", projectId);

        return json({ deletedProject });
      }
      default: {
        return redirect("/dashboard");
      }
    }
  } catch (error) {
    console.error("Unexpected error in project actions", error);
    return json({ error: "An unexpected error occurred" }, { status: 500 });
  }
};

export default function Dashboard() {
  const {
    projects: initialProjects,
    page: initialPage,
    hasMore: initialHasMore,
  } = useLoaderData<typeof loader>();
  const [projects, setProjects] = useState<ProjectType[]>(initialProjects);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const fetcher = useFetcher<typeof loader>();
  const [showProjects, setShowProjects] = useState<boolean>(false);
  const projectRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation(); // Use useLocation to get the current path
  const navigation = useNavigation();
  const navigate = useNavigate();
  const loadingCreateProject =
    (navigation.state === "submitting" || navigation.state === "loading") &&
    navigation.formData?.get("_action") === "create_project";
  const actionData = useActionData<typeof action>();

  if (actionData) {
    console.log("Action Data: ", actionData);
  }

  const createProjectFormRef = useRef<HTMLFormElement>(null);
  const createProjectInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loadingCreateProject) {
      createProjectFormRef.current?.reset();
      createProjectInputRef.current?.focus();
    }
  }, [loadingCreateProject]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      // If clicked outside of the menu or button, close the menu
      if (
        projectRef.current &&
        !projectRef.current.contains(e.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(e.target as Node)
      ) {
        setShowProjects(false);
      }
    }

    // Add event listener only when the projects menu is open
    if (showProjects) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup function to remove event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProjects]);

  useEffect(() => {
    if (actionData?.newProject) {
      setProjects((prevProjects) => [actionData.newProject, ...prevProjects]);
      navigate(`/dashboard/projects/${actionData?.newProject.id}`);
    }
  }, [actionData, navigate]);

  const loadMoreProjects = () => {
    fetcher.load(`/dashboard?page=${page + 1}`);
  };

  useEffect(() => {
    if (fetcher.data && fetcher.state === "idle") {
      setProjects((prevProjects) => {
        const newProjects = [...prevProjects];
        fetcher.data.projects.forEach((project: ProjectType) => {
          if (!newProjects.some((p) => p.id === project.id)) {
            newProjects.push(project);
          }
        });
        return newProjects;
      });
      setPage(fetcher.data.page);
      setHasMore(fetcher.data.hasMore);
    }
  }, [fetcher.data, fetcher.state]);

  const isDashboardRoute = location.pathname === "/dashboard";

  const projectRoutes = [
    "/dashboard/projects",
    "/dashboard/localtasks",
    "/dashboard",
  ]; // Add other project links if necessary

  const isNavigatingToProject = projectRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  const loadingPage =
    navigation.state === "loading" &&
    !navigation.formData &&
    !isNavigatingToProject;
  // console.log("Loading page dashboard: ", loadingPage);

  return loadingPage ? (
    <PageLoader />
  ) : (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowProjects(!showProjects);
        }}
        ref={menuButtonRef}
        className={styles.dashboardMenuBtn}
      >
        {showProjects ? (
          <i className="ri-menu-unfold-2-fill"></i>
        ) : (
          <i className="ri-menu-fold-2-fill"></i>
        )}
      </button>
      <div className={styles.dashboardContainer}>
        <nav
          ref={projectRef}
          className={`${styles.projectsContainer} ${
            showProjects && styles.showProjectContainer
          }`}
          aria-hidden={!showProjects}
        >
          <button
            onClick={() => setShowProjects(false)}
            className={styles.projectsCloseBtn}
          >
            <i className="ri-close-line"></i>
          </button>
          <NavLink
            preventScrollReset={true}
            to="/dashboard/localtasks"
            className={({ isActive, isPending }) =>
              `${styles.projectLink} ${
                isPending
                  ? styles.projectLinkPending
                  : isActive
                  ? styles.projectLinkActive
                  : ""
              }`
            }
            onClick={() => setShowProjects(false)}
          >
            Home
          </NavLink>
          {/* Render project links */}
          <h2 className="text-3xl font-bold">Projects</h2>
          <Form
            className={styles.createProjectForm}
            method="post"
            ref={createProjectFormRef}
          >
            <input
              type="text"
              name="title"
              id="title"
              placeholder="Project name"
              aria-label="project name"
              ref={createProjectInputRef}
              disabled={loadingCreateProject}
            />
            <button
              type="submit"
              name="_action"
              value="create_project"
              disabled={loadingCreateProject}
            >
              {loadingCreateProject ? (
                <ButtonLoader />
              ) : (
                <i className="ri-add-large-line"></i>
              )}
            </button>
          </Form>
          {projects.length > 0 ? (
            projects.map((project: ProjectType) => {
              return (
                <ProjectListElement
                  project={project}
                  key={project.id}
                  setProjects={setProjects}
                />
              );
            })
          ) : (
            <p>No Projects</p>
          )}
          {hasMore && (
            <button
              onClick={loadMoreProjects}
              disabled={fetcher.state !== "idle"}
              className={styles.moreButton}
            >
              {fetcher.state !== "idle" ? <ButtonLoader /> : "More"}
            </button>
          )}
        </nav>
        <div className={styles.tasksContainer}>
          {isDashboardRoute && (
            <>
              <div className={styles.dashboardTasksDiv}>
                <p>Manage your day to day tasks on the web.</p>
                <Link
                  to="/dashboard/localtasks"
                  className={styles.projectLink}
                  style={{ width: "fit-content", fontSize: "2rem" }}
                >
                  View All Tasks
                </Link>
              </div>
            </>
          )}
          <Outlet context={{ projects, setProjects }} />
        </div>
      </div>
    </>
  );
}
