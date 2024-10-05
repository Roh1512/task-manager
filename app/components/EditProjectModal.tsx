import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router-dom";
import { ProjectType } from "~/utils/types.server";
import { ButtonLoader } from "./ButtonLoader";

import styles from "../Styles/EditProjectModal.module.css";

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

export const EditProject = ({
  project,
  setProjects,
}: {
  project: Project | null;
  setProjects: React.Dispatch<React.SetStateAction<ProjectType[]>>;
}) => {
  const [show, setShow] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fetcher = useFetcher<EditedProject>();

  const submitting =
    fetcher.state === "submitting" &&
    fetcher.formData?.get("_action") === "edit_project";

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!submitting && e.target === e.currentTarget) {
      setIsClosing(true); // Trigger closing animation
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setIsClosing(true);
    }
  };

  useEffect(() => {
    if (show && inputRef.current) {
      inputRef.current.focus();
    }
  }, [show]);

  // Effect to close modal after animation
  useEffect(() => {
    if (isClosing) {
      const timeout = setTimeout(() => {
        setShow(false); // Close the modal after the animation ends
        setIsClosing(false); // Reset the closing state
      }, 200); // corresponds to the animation duration
      return () => clearTimeout(timeout);
    }
  }, [isClosing]);

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

  return (
    <>
      <button
        type="button"
        onClick={() => setShow(true)}
        aria-label="Edit Project"
        className={styles.editBtn}
      >
        <i className="ri-edit-box-fill"></i>
      </button>
      {show && (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
        <div
          className={`${styles.EditProjectContainer} ${
            isClosing ? styles.fadeOut : styles.fadeIn
          }`}
          onClick={handleOutsideClick}
        >
          <fetcher.Form method="post" className={styles.editProjectForm}>
            <button
              type="button"
              onClick={handleClose}
              className={styles.closeBtn}
            >
              <i className="ri-close-large-line"></i>
            </button>
            <fieldset disabled={submitting}>
              <input
                type="hidden"
                id="projectId"
                name="projectId"
                value={project?.id}
                className={styles.projectTitle}
              />
              <div className={styles.inputTitleContainer}>
                <label htmlFor="title">Project Title: </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  defaultValue={project?.title}
                  ref={inputRef}
                  aria-label="Project Title"
                />
              </div>
              <textarea
                name="description"
                id="description"
                defaultValue={project?.description || undefined}
                placeholder="Add a project description"
                rows={4}
                className={styles.descriptionTextArea}
              ></textarea>
              <div>
                <button
                  type="submit"
                  name="_action"
                  id="_action"
                  value="edit_project"
                >
                  {submitting ? <ButtonLoader /> : "Submit"}
                </button>
              </div>
            </fieldset>
          </fetcher.Form>
        </div>
      )}
    </>
  );
};
