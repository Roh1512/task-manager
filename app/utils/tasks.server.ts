import { requireUserId } from "./auth.server";

export const getTasksWithoutProject = async (request: Request) => {
  try {
    const userId = await requireUserId(request);

    console.log(userId);
    return userId;
  } catch (error) {
    console.error("getTasksWithoutProject error: ", error);
    throw error;
  }
};
