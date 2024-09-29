import { requireUserId } from "./auth.server";
import { prisma } from "./prisma.server";

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
