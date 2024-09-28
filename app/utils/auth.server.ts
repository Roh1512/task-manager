import { json } from "@remix-run/node";
import { prisma } from "./prisma.server";
import { LoginForm } from "./types.server";
import bcrypt from "bcryptjs";
import {
  commitSession,
  destroySession,
  getSession,
  sessionStorage,
} from "./sessions.server";
import { redirect } from "react-router";

export const createUserSession = async (userId: string, redirectTo: string) => {
  const session = await sessionStorage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export const login = async (form: LoginForm) => {
  const user = await prisma.user.findUnique({
    where: {
      email: form.email,
    },
  });
  if (!user || !(await bcrypt.compare(form.password, user.password))) {
    return json({ error: "Incorrect login" }, { status: 400 });
  }
  return createUserSession(user.id, "/dashboard");
};

function getUserSession(request: Request) {
  return getSession(request.headers.get("Cookie"));
}

export async function logout(request: Request) {
  const session = await getUserSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (typeof userId !== "string") {
    return null;
  }
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  } catch (error) {
    throw logout(request);
  }
}
async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    return null;
  }
  return userId;
}

export const isLoggedIn = async (request: Request) => {
  const session = await getUserSession(request);
  const userId = session.has("userId");
  if (userId) {
    return true;
  }
  return false;
};
