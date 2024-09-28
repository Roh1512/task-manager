import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from "@remix-run/react";
import styles from "~/Styles/ErrorComponent.module.css";

export function ErrorComponent() {
  const error = useRouteError();
  const navigate = useNavigate();

  if (isRouteErrorResponse(error)) {
    return (
      <div className={styles.errorBoundaryProjectPage}>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
        <div className={styles.linksErrorDiv}>
          <button
            onClick={() => navigate("/")}
            className={styles.homeLinkErrorPage}
          >
            Home
          </button>
          <button
            onClick={() => navigate(-1)}
            className={styles.homeLinkErrorPage}
          >
            Go Back
          </button>
          <button
            className={styles.homeLinkErrorPage}
            onClick={() => navigate(".")}
          >
            Reload
          </button>
        </div>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div className={styles.errorBoundaryProjectPage}>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
        <div className={styles.linksErrorDiv}>
          <button
            onClick={() => navigate("/")}
            className={styles.homeLinkErrorPage}
          >
            Home
          </button>
          <button
            onClick={() => navigate(-1)}
            className={styles.homeLinkErrorPage}
          >
            Go Back
          </button>
          <button
            className={styles.homeLinkErrorPage}
            onClick={() => navigate(".")}
          >
            Reload
          </button>
        </div>
      </div>
    );
  } else {
    return (
      <div className={styles.errorBoundaryProjectPage}>
        <h1>Unknown Error</h1>
        <div className={styles.linksErrorDiv}>
          <button
            onClick={() => navigate("/")}
            className={styles.homeLinkErrorPage}
          >
            Home
          </button>
          <button
            onClick={() => navigate(-1)}
            className={styles.homeLinkErrorPage}
          >
            Go Back
          </button>
          <button
            className={styles.homeLinkErrorPage}
            onClick={() => navigate(".")}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
