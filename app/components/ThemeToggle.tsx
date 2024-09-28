import { useEffect } from "react";
import { Theme, useTheme } from "remix-themes";

export function ToggleThemeDropDown() {
  const [theme, setTheme, { definedBy }] = useTheme();

  useEffect(() => {
    console.log({ theme, definedBy });
  }, [definedBy, theme]);
  return (
    <div style={{ margin: "1rem 0" }}>
      <label style={{ display: "flex", gap: "8px" }}>
        Theme
        <select
          name="theme"
          value={definedBy === "SYSTEM" ? "" : theme ?? ""}
          onChange={(e) => {
            const nextTheme = e.target.value;

            if (nextTheme === "") {
              setTheme(null);
            } else {
              setTheme(nextTheme as Theme);
            }
          }}
        >
          <option value="">System</option>
          <option value={Theme.LIGHT}>Light</option>
          <option value={Theme.DARK}>Dark</option>
        </select>
      </label>
    </div>
  );
}

export function ThemeToggleButton() {
  const [theme, setTheme, { definedBy }] = useTheme();
  useEffect(() => {
    console.log({ theme, definedBy });
  }, [definedBy, theme]);
  const changeTheme = () => {
    theme === "dark" ? setTheme(Theme.LIGHT) : setTheme(Theme.DARK);
  };
  return (
    <button onClick={changeTheme} className="themeButton">
      {theme === "dark" ? (
        <i className="ri-sun-fill"></i>
      ) : (
        <i className="ri-moon-fill"></i>
      )}
    </button>
  );
}
