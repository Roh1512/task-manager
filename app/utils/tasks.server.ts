import { isAfter } from "date-fns";
import { requireUserId } from "./auth.server";
import { prisma } from "./prisma.server";
import { CreateTaskForm } from "./types.server";
import { json } from "@remix-run/node";

export const getTasksWithoutProject = async (
  request: Request,
  skip = 0,
  take = 5
) => {
  try {
    const userId = await requireUserId(request);
    const tasks = await prisma.task.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: skip,
      take: take,
    });
    // console.log("Tasks without project fetched: ", tasks);
    return tasks;
  } catch (error) {
    console.error("getTasksWithoutProject error: ", error);
    throw error;
  }
};

export const createTask = async (task: CreateTaskForm) => {
  try {
    const now = new Date();
    const expired = isAfter(now, new Date(task.dueDate));
    const newTask = await prisma.task.create({
      data: {
        userId: task.userId,
        projectId: task.projectId || undefined,
        title: task.title,
        description: task.description || undefined,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined, // Check if dueDate exists
        fromDate: task.fromDate ? new Date(task.fromDate) : undefined, // Check if fromDate exists
        priority: task.priority || "LOW",
        status: expired ? "EXPIRED" : "IN_PROGRESS",
        createdAt: new Date(),
      },
    });
    return newTask;
  } catch (error) {
    console.error("Create task error: ", error);
    return { error: "Error creating task", status: 500 };
  }
};

export const deleteTaskById = async (taskId: string) => {
  try {
    const deletedTask = await prisma.task.delete({
      where: {
        id: taskId,
      },
    });
    console.log("Deleted task: ", deletedTask);
    return deletedTask;
  } catch (error) {
    console.error("Error deleting task", error);
    throw new Error("Error deleting task");
  }
};

export const toggleTaskStatus = async (
  taskId: string,
  status: "COMPLETE" | "IN_PROGRESS" | "EXPIRED"
) => {
  try {
    const findTask = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });
    if (findTask?.status === "EXPIRED") {
      return json({ error: "Expired" }, { status: 400 });
    }
    const taskEdited = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        status: status,
        updatedAt: new Date(),
      },
    });
    console.log("Updated Task: ", taskEdited);

    return taskEdited;
  } catch (error) {
    console.error("Error Changing task status", error);
    throw new Error("Error Changing task status");
  }
};

export const markExpired = async (taskId: string) => {
  try {
    const taskEdited = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        status: "EXPIRED",
        updatedAt: new Date(),
      },
    });
    console.log("Expired task: ", taskEdited.title);
    return taskEdited;
  } catch (error) {
    console.error("Error Changing task status to expired", error);
    throw new Error("Error Changing task status to expired");
  }
};

export const countTasks = async (request: Request, projectId?: string) => {
  const userId = await requireUserId(request);
  if (projectId) {
    const count = await prisma.task.count({
      where: {
        userId: userId,
        projectId: projectId,
      },
    });
    return count;
  } else {
    const count = await prisma.task.count({
      where: {
        userId: userId,
      },
    });
    return count;
  }
};
