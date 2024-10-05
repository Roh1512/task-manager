/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import styles from "../Styles/DeleteConformation.module.css";
import { useFetcher } from "@remix-run/react";
import { ButtonLoader } from "./ButtonLoader";

import { action as profileAction } from "../routes/profile";

export const DeleteConformation = ({
  setShowDelete,
}: {
  setShowDelete: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [exiting, setExiting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const fetcher = useFetcher<typeof profileAction>();

  const loadingDelete =
    fetcher.state === "submitting" &&
    fetcher.formData?.get("_action") === "delete_profile";

  const handleClose = () => {
    setExiting(true); // Start exit animation
    setTimeout(() => {
      setShowDelete(false); // Actually unmount after animation
    }, 200); // Match the duration of the animation
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      handleClose(); // Close modal on Escape key press
    }
  };

  const handleClickOutside = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", (e) => handleKeyDown(e as any)); // casting to any since we can't apply React event outside of React handlers

    return () =>
      document.removeEventListener("keydown", (e) => handleKeyDown(e as any));
  }, [handleKeyDown]);

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      className={`${styles.fullScreenContainer} ${exiting ? styles.exit : ""}`}
      onClick={handleClickOutside}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      <div className={styles.contentContainer} ref={contentRef}>
        <p>Are you sure?</p>
        <fetcher.Form method="post">
          <div className="mb-4">
            <input
              type="password"
              id="password"
              name="password"
              required
              placeholder="Enter password to continue."
              aria-label="Enter password to continue"
            />
            {fetcher?.data?.error && (
              <p className="text-sm text-red-800 text-center mt-1 bg-slate-300">
                {fetcher.data.error}
              </p>
            )}
          </div>
          <div className={styles.btnContainer}>
            <button
              type="submit"
              name="_action"
              value="delete_profile"
              className="bg-green-900 text-white rounded-3xl"
            >
              {loadingDelete ? <ButtonLoader /> : "Yes"}
            </button>
            <button type="button" className="rounded-3xl" onClick={handleClose}>
              No
            </button>
          </div>
        </fetcher.Form>
      </div>
    </div>
  );
};
