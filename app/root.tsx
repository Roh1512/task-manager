import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import {
  ThemeProvider,
  useTheme,
  PreventFlashOnWrongTheme,
} from "remix-themes";
import { themeSessionResolver } from "./utils/sessions.server";

import tailwindStyles from "./tailwind.css?url";
import styles from "./Styles/index.css?url";
import { HomeLayout } from "./components/Layout";
import { isLoggedIn } from "./utils/auth.server";

// Return the theme from the session storage using the loader
export const loader: LoaderFunction = async ({ request }) => {
  const { getTheme } = await themeSessionResolver(request);
  const loggedIn = await isLoggedIn(request);
  return {
    theme: getTheme(),
    isLoggedIn: loggedIn,
  };
};

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "stylesheet", href: tailwindStyles },
  { rel: "stylesheet", href: styles, as: "style" },
];

function App() {
  const data = useLoaderData<typeof loader>();
  const [theme] = useTheme();
  return (
    <html lang="en" data-theme={theme ?? ""} className={theme ?? ""}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />
        <Links />
      </head>
      <body>
        <HomeLayout>
          <Outlet />
        </HomeLayout>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function AppWithProviders() {
  const data = useLoaderData<typeof loader>();
  return (
    <ThemeProvider specifiedTheme={data.theme} themeAction="/action/set-theme">
      <App />
    </ThemeProvider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);
  return (
    <html lang="en">
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        {/* add the UI you want your users to see */}
        <ErrorComponent />
        <Scripts />
      </body>
    </html>
  );
}

function ErrorComponent() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="errorBoundaryContainer">
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
        <div className="erroPageLinksContainer">
          <Link to="/" reloadDocument>
            Home
          </Link>
          <Link to="/">Go back</Link>
        </div>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div className="errorBoundaryContainer">
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}
