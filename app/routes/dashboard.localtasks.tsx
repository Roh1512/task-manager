import { json, LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { isLoggedIn } from "~/utils/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
  const loggedIn = await isLoggedIn(request);
  if (!loggedIn) {
    return redirect("/login");
  }
  const localTasks = ["Local Task 1", "Local Task 2", "Local Task 3"];
  return json({ localTasks });
};

export default function LocalTasks() {
  const { localTasks } = useLoaderData<typeof loader>();
  return (
    <>
      <h1>Local Tasks</h1>
      <h2>Local Tasks</h2>
      <ul>
        {localTasks.map((task: string, index: number) => (
          <li key={index}>{task}</li>
        ))}
      </ul>
    </>
  );
}
