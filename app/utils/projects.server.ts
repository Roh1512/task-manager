import { prisma } from "./prisma.server";
import { CreateProjectForm } from "./types.server";

export const createProject = async (project: CreateProjectForm) => {
  try {
    const newProject = await prisma.project.create({
      data: {
        title: project.title,
        description: project.description,
        userId: project.userId,
        createdAt: new Date(),
      },
    });
    console.log("Project added:", newProject);
    return newProject;
  } catch (error) {
    console.error("Error adding project:", error);
    throw new Error("Could not add project");
  }
};

export async function deleteProject(projectId: string) {
  try {
    // First, delete all tasks associated with the project
    await prisma.task.deleteMany({
      where: {
        projectId: projectId,
      },
    });

    // Then, delete the project itself
    const deletedProject = await prisma.project.delete({
      where: {
        id: projectId,
      },
    });

    console.log("Project and associated tasks deleted:", deletedProject);
    return deletedProject;
  } catch (error) {
    console.error("Error deleting project and tasks:", error);
    throw new Error("Could not delete project and its tasks");
  }
}

export const getProjectsByUser = async (userId: string, skip = 0, take = 5) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: skip,
      take: take,
    });
    return projects;
  } catch (error) {
    console.error("Error deleting project and tasks:", error);
    throw new Error("Could not retrieve");
  }
};
