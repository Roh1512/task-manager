import { Task } from "@prisma/client";
import { useFetcher } from "@remix-run/react";
import { ButtonLoader } from "./ButtonLoader";
import { format, isAfter } from "date-fns";
import { useEffect, useState } from "react";
import styles from "../Styles/TaskItem.module.css";

export const TaskItem = ({ task }: { task: Task }) => {
  const fetcher = useFetcher();
  const [isExpired, setIsExpired] = useState<boolean>(false);

  const deleteLoading =
    fetcher.state === "submitting" &&
    fetcher.formData?.get("_action") === "delete_task" &&
    fetcher.formData?.get("taskId") === task.id;

  // Check if the task has expired every second
  useEffect(() => {
    const checkTaskExpiry = () => {
      if (task.dueDate && task.status !== "EXPIRED") {
        const dueDate = new Date(task.dueDate);
        const now = new Date();
        setIsExpired(isAfter(now, dueDate) ? true : false); // Updates the expiration status
      } else if (task.status === "EXPIRED") {
        setIsExpired(true);
      }
    };

    const interval = setInterval(() => {
      checkTaskExpiry();
    }, 1000);

    return () => clearInterval(interval); // Clear the interval when the component is unmounted
  }, [task.dueDate, task.status]);

  // Automatically update task status to "EXPIRED" when isExpired becomes true
  useEffect(() => {
    if (isExpired && task.status !== "EXPIRED" && fetcher.state === "idle") {
      // Trigger the status update only once when the task has expired and not already updated
      fetcher.submit(
        {
          taskId: task.id,
          taskStatus: "EXPIRED",
          _action: "update_task_expired",
        },
        {
          method: "POST",
        }
      );
    }
  }, [isExpired, task.id, task.status, fetcher]);

  return (
    <div className={styles.taskItemContainer}>
      <div className="w-full flex items-center justify-evenly">
        <div>
          {task.status === "COMPLETE" || task.status === "EXPIRED" ? (
            <p
              className={`text-2xl ${
                task.status === "EXPIRED" && "text-red-800"
              }`}
            >
              <del>{task.title}</del>
            </p>
          ) : (
            <p className="text-2xl">{task.title}</p>
          )}
          {task.description &&
            (task.status === "COMPLETE" || task.status === "EXPIRED" ? (
              <p
                className={`text-lg ${
                  task.status === "EXPIRED" && "text-red-800"
                }`}
              >
                <del>{task?.description}</del>
              </p>
            ) : (
              <p className="text-lg">{task.description}</p>
            ))}
        </div>
        <div>
          {task.fromDate && task.dueDate ? (
            <p className="text-sm max-w-40">
              From <span>{format(new Date(task.fromDate), "PPP p")}</span> to{" "}
              <span>{format(new Date(task.dueDate), "PPP p")}</span>
            </p>
          ) : task.dueDate ? (
            <p className="text-sm">
              Due at <span>{format(new Date(task.dueDate), "PPP p")}</span>
            </p>
          ) : (
            <p className="text-sm">No due date</p>
          )}

          {/* Dynamically display if the task has expired */}
          {/* {isExpired ? (
            <p className="text-red-700">Task expired</p>
          ) : (
            <p className="text-green-500">
              On track <span>{String(isExpired)}</span>
            </p>
          )} */}

          {/* <p className={`${task.status === "EXPIRED" && "text-red-700"}`}>
            {task.status}
          </p> */}
        </div>
      </div>
      <div className="flex gap-4 items-center justify-center ">
        {task.status !== "EXPIRED" && (
          <fetcher.Form method="post">
            <input type="hidden" name="taskId" id="taskId" value={task.id} />
            <input
              type="checkbox"
              name="isCompleted"
              id={`isCompleted-${task.id}`}
              checked={task.status === "COMPLETE"}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              onChange={() => {
                fetcher.submit(
                  {
                    taskId: task.id,
                    taskStatus:
                      task.status === "COMPLETE" ? "IN_PROGRESS" : "COMPLETE",
                    _action: "update_task_status",
                  },
                  {
                    method: "POST",
                  }
                );
              }}
            />
          </fetcher.Form>
        )}
        <fetcher.Form method="post">
          <input type="hidden" name="taskId" id="taskId" value={task.id} />
          <button
            type="submit"
            name="_action"
            value="delete_task"
            className="rounded-full text-red-800 bg-transparent"
          >
            {deleteLoading ? (
              <ButtonLoader />
            ) : (
              <i className="ri-delete-bin-3-fill"></i>
            )}
          </button>
        </fetcher.Form>
      </div>
    </div>
  );
};
