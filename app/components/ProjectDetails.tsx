import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import styles from "../Styles/ProjectDetails.module.css";
import { ProjectType } from "~/utils/types.server";

interface Project {
  id: string;
  title: string;
  description: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
interface EditedProject {
  editedProject: ProjectType | undefined;
}
export const ProjectDetails = ({
  project,
  setProjects,
}: {
  project: Project | null;
  setProjects: React.Dispatch<React.SetStateAction<ProjectType[]>>;
}) => {
  const fetcher = useFetcher<EditedProject>();
  const [edit, setEdit] = useState<boolean>(false);
  console.log(fetcher.data);
  const [expand, setExpand] = useState<boolean>(false);

  const submitting =
    fetcher.state !== "idle" &&
    fetcher.formData?.get("projectId") === project?.id;
  useEffect(() => {
    if (fetcher.data?.editedProject && fetcher.state === "idle") {
      setEdit(false);
    }
  }, [fetcher]);
  useEffect(() => {
    if (fetcher.data?.editedProject) {
      setProjects((prevProjects) =>
        prevProjects.map((proj) =>
          proj.id === project?.id && fetcher.data?.editedProject
            ? fetcher.data.editedProject
            : proj
        )
      );
    }
  }, [fetcher.data?.editedProject, project, setProjects]);
  console.log("Expand: ", expand);

  return (
    <>
      <div
        className={`${styles.projectDetails}  ${
          expand ? styles.expand : styles.collapse
        }`}
      >
        {edit ? (
          <>
            <fetcher.Form
              method="post"
              className={`${styles.projectDetailsContainer}`}
            >
              <fieldset disabled={submitting || !edit}>
                <input
                  type="hidden"
                  id="projectId"
                  name="projectId"
                  value={project?.id}
                />
                <div className={styles.inputTitleContainer}>
                  <label htmlFor="title">Project Title: </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    defaultValue={project?.title}
                    aria-label="Project Title"
                  />
                </div>
                <textarea
                  name="description"
                  id="description"
                  defaultValue={project?.description || undefined}
                  placeholder="Add a project description"
                  rows={4}
                  disabled={!edit}
                  className={styles.descriptionTextArea}
                ></textarea>
                <div className={styles.buttons}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => setEdit(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type={edit ? "submit" : "button"}
                    name="_action"
                    id="_action"
                    value="edit_project"
                    disabled={submitting || !edit}
                    className={styles.submitBtn}
                  >
                    {submitting ? "Changing..." : "Submit"}
                  </button>
                </div>
              </fieldset>
            </fetcher.Form>
          </>
        ) : (
          <>
            <div className={styles.projectDetailsContainer}>
              <h1 className={styles.projectTitle}>{project?.title}</h1>
              {project?.description && <p>{project?.description}</p>}
            </div>
          </>
        )}
        {!edit && (
          <div className={styles.buttons}>
            <button
              type="button"
              onClick={() => setEdit((prev) => !prev)}
              className={`${styles.editBtn}`}
              disabled={submitting}
            >
              <i className="ri-edit-2-fill"></i>
            </button>
          </div>
        )}
      </div>
      <div className={styles.buttons}>
        <button
          onClick={() => setExpand((prev) => !prev)}
          className={styles.expandBtn}
        >
          {expand ? (
            <i className="ri-arrow-up-wide-line"></i>
          ) : (
            <i className="ri-arrow-down-wide-line"></i>
          )}
        </button>
      </div>
    </>
  );
};
