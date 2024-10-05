import styles from "../Styles/ProjectDetails.module.css";
import { ProjectType } from "~/utils/types.server";
import { EditProject } from "./EditProjectModal";

export interface Project {
  id: string;
  title: string;
  description: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
export const ProjectDetails = ({
  project,
  setProjects,
}: {
  project: Project | null;
  setProjects: React.Dispatch<React.SetStateAction<ProjectType[]>>;
}) => {
  return (
    <>
      <EditProject project={project} setProjects={setProjects} />
      <div className={styles.projectDetailsContainer}>
        <h1 className={styles.projectTitle}>{project?.title}</h1>
        {project?.description && <p>{project?.description}</p>}
      </div>
    </>
  );
};
