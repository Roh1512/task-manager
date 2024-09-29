import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import sytles from "../Styles/ProjectDetails.module.css";
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
  editedProject: ProjectType;
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
        prevProjects.map((proj) => (proj.id === project?.id ? project : proj))
      );
    }
  }, [fetcher.data?.editedProject, project, setProjects]);
  return (
    <>
      {edit ? (
        <>
          <fetcher.Form
            method="post"
            className={sytles.projectDetailsContainer}
          >
            <fieldset disabled={submitting || !edit}>
              <input
                type="hidden"
                id="projectId"
                name="projectId"
                value={project?.id}
              />
              <div className={sytles.inputTitleContainer}>
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
                className={sytles.descriptionTextArea}
              ></textarea>
              <div className={sytles.buttons}>
                <button
                  className={sytles.cancelBtn}
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
                  className={sytles.submitBtn}
                >
                  {submitting ? "Changing..." : "Submit"}
                </button>
              </div>
            </fieldset>
          </fetcher.Form>
        </>
      ) : (
        <>
          <div className={sytles.projectDetailsContainer}>
            <h1 className={sytles.projectTitle}>{project?.title}</h1>
            {project?.description && <p>{project?.description}</p>}
          </div>
        </>
      )}
      {!edit && (
        <div className={sytles.buttons}>
          <button
            type="button"
            onClick={() => setEdit((prev) => !prev)}
            className={sytles.editBtn}
            disabled={submitting}
          >
            <i className="ri-edit-2-fill"></i>
          </button>
        </div>
      )}
    </>
  );
};
