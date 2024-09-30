import { useFetcher } from "@remix-run/react";
import styles from "../Styles/AddTask.module.css";
import { useState } from "react";

export const AddTaskForm = () => {
  const [more, setMore] = useState<boolean>(false);
  const fetcher = useFetcher();
  return (
    <>
      <h2>Add Task</h2>
      <fetcher.Form className={styles.addTaskForm}>
        <div className={styles.addTaskInputGroup}>
          <input
            type="text"
            name="title"
            id="title"
            placeholder="Enter task"
            className="col-span-2"
          />
          <div className="flex flex-col items-center justify-center col-span-1">
            <label htmlFor="dueDate"> Due Date:</label>
            <input
              type="date"
              name="dueDate"
              id="dueDate"
              placeholder="Due date"
            />
          </div>
          {more && (
            <>
              <input
                type="text"
                name="description"
                id="description"
                placeholder="Add a description"
                className="col-span-3 w-full max-w-full"
              />
              <div className="flex">
                <label htmlFor="cars">Priority: </label>

                <select name="priority" id="priority">
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>
            </>
          )}
        </div>
        <button className={styles.addTaskBtn}>
          <i className="ri-add-large-fill"></i>
        </button>
      </fetcher.Form>
      <button onClick={() => setMore((prev) => !prev)}>
        {more ? "Hide" : "More"}
      </button>
    </>
  );
};
