import { requireUserId } from "./auth.server";
import { prisma } from "./prisma.server";
import { CreateTaskForm } from "./types.server";

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
    console.log("Tasks without project fetched: ", tasks);
    return tasks;
  } catch (error) {
    console.error("getTasksWithoutProject error: ", error);
    throw error;
  }
};

export const createTask = async (task: CreateTaskForm) => {
  try {
    const newTask = await prisma.task.create({
      data: {
        userId: task.userId,
        projectId: task.projectId || undefined,
        title: task.title,
        description: task.description || null,
        dueDate: task.dueDate,
        priority: task.priority || "LOW",
        status: "IN_PROGRESS",
      },
    });
    return newTask;
  } catch (error) {
    console.error("Create task error: ", error);
    throw error;
  }
};
