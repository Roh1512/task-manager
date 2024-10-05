import { useFetcher } from "@remix-run/react";
import styles from "../Styles/AddTask.module.css";
import { useEffect, useRef, useState } from "react";
import { ButtonLoader } from "./ButtonLoader";

export const AddTaskForm = ({ projectId }: { projectId?: string }) => {
  const [show, setShow] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false); // New state to manage closing animation
  const [fromDate, setFromDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const fetcher = useFetcher();
  const taskAddLoader =
    fetcher.state === "submitting" &&
    fetcher.formData?.get("_action") === "add_task";

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!taskAddLoader && e.target === e.currentTarget) {
      setIsClosing(true); // Trigger closing animation
    }
  };

  const handleClose = () => {
    if (!taskAddLoader) {
      setIsClosing(true); // Trigger closing animation
    }
  };

  // Effect to focus the input when the modal opens
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

  return (
    <>
      <button
        className={styles.addTaskDisplayBtn}
        onClick={() => setShow(true)}
        aria-label="Add task button"
      >
        {show ? "Close" : "Add Task"}
      </button>
      {show && (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
        <div
          className={`${styles.addTaskContainer} ${
            isClosing ? styles.fadeOut : styles.fadeIn
          }`} // Apply the animation class conditionally
          onClick={handleOutsideClick}
        >
          <fetcher.Form
            className={styles.addTaskForm}
            method="post"
            action={
              projectId
                ? `/dashboard/projects/${projectId}`
                : "/dashboard/localtasks"
            }
          >
            <button
              className={styles.closeBtn}
              onClick={handleClose}
              aria-label="close button"
              disabled={taskAddLoader}
              type="button"
            >
              <i className="ri-close-large-line" aria-hidden></i>
            </button>
            <h2 className="text-center text-2xl font-extrabold">Add Task</h2>
            {projectId && (
              <input type="hidden" name="projectId" value={projectId} />
            )}
            <div className={styles.addTaskInputGroup}>
              <input
                type="text"
                name="title"
                id="title"
                placeholder="Enter task"
                className="col-span-4 max-h-min max-w-full text-2xl"
                aria-label="Enter task"
                ref={inputRef}
              />
              <div className="col-span-2 flex items-center justify-center gap-3">
                <label htmlFor="fromDate" className={`${styles.dateTimeLabel}`}>
                  From Date
                </label>
                <input
                  type="datetime-local"
                  name="fromDate"
                  id="fromDate"
                  placeholder="Due date"
                  aria-label="Select date and time the task starts"
                  className="max-w-9 cursor-pointer"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
                <p>{fromDate ? fromDate : "Not set"}</p>
              </div>
              <div className="col-span-2 flex items-center justify-center gap-4">
                <label htmlFor="dueDate"> Due Date:</label>
                <input
                  type="datetime-local"
                  name="dueDate"
                  id="dueDate"
                  placeholder="Due date"
                  aria-label="Select data and time the task is due"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="max-w-9 cursor-pointer"
                />
                <p>{dueDate ? dueDate : "Not set"}</p>
              </div>
              <input
                type="text"
                name="description"
                id="description"
                placeholder="Add a description"
                className="col-span-4 w-full max-w-full"
                aria-label="Add a description for the task"
              />
              <div className="flex items-center justify-center gap-3">
                <label htmlFor="priority">Priority: </label>

                <select
                  name="priority"
                  id="priority"
                  className="p-2 border-white border-2 bg-black text-white"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              name="_action"
              value="add_task"
              className={styles.addTaskBtn}
              disabled={taskAddLoader}
            >
              {taskAddLoader ? (
                <ButtonLoader />
              ) : (
                <>
                  <span>Add Task</span> <i className="ri-add-large-fill"></i>
                </>
              )}
            </button>
          </fetcher.Form>
        </div>
      )}
    </>
  );
};
