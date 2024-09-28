import { createCookieSessionStorage } from "@remix-run/node";
import { createThemeSessionResolver } from "remix-themes";

export const themeSessionResolver = createThemeSessionResolver(
  createCookieSessionStorage({
    cookie: {
      name: "__remix-themes",
      // domain: 'remix.run',
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secrets: ["s3cr3t"],
      // secure: true,
    },
  })
);
/* Note: make sure you have domain and secure parameters set only for your production environment. Otherwise, Safari won't store the cookie if you set these parameters on localhost. */
const sessionSecret = process.env.AUTH_SECRET;
if (!sessionSecret) {
  throw new Error("Session secret is not set.");
}
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_auth_token",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 25 * 30,
    httpOnly: true,
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;
