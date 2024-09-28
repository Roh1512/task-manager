import { Link, NavLink, useLoaderData } from "@remix-run/react";
import { ThemeToggleButton } from "./ThemeToggle";
import { loader } from "~/root";

export function HomeLayout({ children }: { children: React.ReactNode }) {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <>
      <header>
        <Link to="/" className="logoText">
          ToDo
        </Link>
        <nav className="headerNav">
          <ThemeToggleButton />
          {loaderData?.isLoggedIn && (
            <NavLink to="/profile" className="profileLink">
              <i className="ri-user-fill"></i>
            </NavLink>
          )}
        </nav>
      </header>
      <main>{children}</main>
      <footer>
        <p>
          &#169; {new Date().getFullYear()}{" "}
          <a href="https://github.com/Roh1512" target="blank">
            Roh1512
          </a>
        </p>
      </footer>
    </>
  );
}
