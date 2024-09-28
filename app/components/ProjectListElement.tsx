import {
  NavLink,
  useNavigate,
  useFetcher,
  useLocation,
} from "@remix-run/react";
import { Project } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import styles from "../Styles/projectListElement.module.css";
import { ButtonLoader } from "./ButtonLoader";
import { useEffect } from "react";

import { action as dashboardAction } from "~/routes/dashboard";

export const ProjectListElement = ({
  project,
  setProjects, // Assuming you want to pass setProjects as a prop to manage state
}: {
  project: Project;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}) => {
  const navigate = useNavigate();
  const fetcher = useFetcher<typeof dashboardAction>();
  const loadingDeleteProject =
    fetcher.state === "submitting" &&
    fetcher.formData?.get("projectId") === project.id;
  const location = useLocation();

  const formattedCreatedAtDate = formatDistanceToNow(
    new Date(project.createdAt),
    {
      addSuffix: true,
    }
  );

  useEffect(() => {
    if (fetcher.data?.deletedProject) {
      // Update the projects state after successful deletion
      setProjects((prevProjects) =>
        prevProjects.filter((proj) => proj.id !== project.id)
      );
      if (location.pathname === `/dashboard/projects/${project.id}`) {
        navigate("/dashboard");
      }
    }
  }, [fetcher.data]);

  return (
    <div className={styles.projectLinkDiv}>
      <NavLink
        preventScrollReset={true}
        to={`/dashboard/projects/${project.id}`}
        className={({ isActive, isPending }) =>
          `${styles.projectLink} ${
            isPending
              ? styles.projectLinkPending
              : isActive
              ? styles.projectLinkActive
              : ""
          }`
        }
      >
        {project.title}
        <span className={styles.projectLinkExtraText}>
          {formattedCreatedAtDate}
        </span>
      </NavLink>
      <fetcher.Form method="post" action="/dashboard">
        <input
          type="hidden"
          id="projectId"
          name="projectId"
          value={project.id}
        />
        <button
          className={styles.projectDeleteBtn}
          name="_action"
          value="delete_project"
          aria-label="Delete project"
          disabled={loadingDeleteProject}
        >
          {loadingDeleteProject ? (
            <ButtonLoader />
          ) : (
            <i className="ri-delete-bin-3-fill"></i>
          )}
        </button>
      </fetcher.Form>
    </div>
  );
};
