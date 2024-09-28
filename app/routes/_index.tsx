import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import { isLoggedIn } from "~/utils/auth.server";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const loggedIn = await isLoggedIn(request);

  if (loggedIn) {
    return redirect("/dashboard");
  }
  return null;
};

export default function Index() {
  const navigate = useNavigate();
  return (
    <div className="homePage">
      <div className="hero">
        <div className="heroText">
          <h1>ToDo List</h1>
          <p>Manage your tasks on the web.</p>
          <div className="heroButtonDiv">
            <button
              onClick={() => navigate("/signup")}
              className="authbtns signupBtn"
            >
              Sign Up
            </button>
            <button
              onClick={() => navigate("/login")}
              className="authbtns loginBtn"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
