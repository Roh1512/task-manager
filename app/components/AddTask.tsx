import { useFetcher } from "@remix-run/react";
import styles from "../Styles/AddTask.module.css";
import { useState } from "react";

export const AddTaskForm = () => {
  const [more, setMore] = useState<boolean>(false);
  const fetcher = useFetcher();
  return (
    <div className={styles.addTaskContainer}>
      <fetcher.Form className={styles.addTaskForm} method="post">
        <div className={styles.addTaskInputGroup}>
          <h2 className="col-span-3 text-center text-2xl font-extrabold">
            Add Task
          </h2>
          <input
            type="text"
            name="title"
            id="title"
            placeholder="Enter task"
            className="col-span-2 max-h-min"
          />
          <div
            className={`flex flex-col items-center justify-center col-span-1`}
          >
            <div>
              <label htmlFor="fromDate" className={`${styles.dateTimeLabel}`}>
                From Date
              </label>
              <input
                type="datetime-local"
                name="fromDate"
                id="fromDate"
                placeholder="Due date"
              />
            </div>
            <label htmlFor="dueDate" className={`${styles.dateTimeLabel}`}>
              {" "}
              Due Date:
            </label>
            <input
              type="datetime-local"
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
                className="col-span-4 w-full max-w-full"
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
            </>
          )}
        </div>
        <button
          type="submit"
          name="_action"
          value="add_task"
          className={styles.addTaskBtn}
        >
          <i className="ri-add-large-fill"></i>
        </button>
      </fetcher.Form>
      <button onClick={() => setMore((prev) => !prev)}>
        {more ? "Hide" : "More"}
      </button>
    </div>
  );
};
