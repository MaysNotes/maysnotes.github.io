const root = document.documentElement;

/* ----------------------------------------
   Theme
   ---------------------------------------- */
const themeColor = document.querySelector(
    'meta[name="theme-color"]'
);

const themeToggle = document.getElementById("theme-toggle");

function setTheme(theme) {
    root.dataset.theme = theme;

    if (themeColor) {
        themeColor.setAttribute(
            "content",
            theme === "dark"
                ? "#0d0f12"
                : "#f5f5f2"
        );
    }

    if (!themeToggle) {
        return;
    }

    const themeIcon = themeToggle.querySelector("span");
    const isLight = theme === "light";

    if (themeIcon) {
        themeIcon.textContent = isLight ? "☀" : "☾";
    }

    themeToggle.setAttribute(
        "aria-label",
        isLight
            ? "Switch to dark theme"
            : "Switch to light theme"
    );
}

const savedTheme = localStorage.getItem("theme");
const systemPrefersLight =
    window.matchMedia("(prefers-color-scheme: light)").matches;

const initialTheme =
    savedTheme || (systemPrefersLight ? "light" : "dark");

setTheme(initialTheme);

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const currentTheme = root.dataset.theme || "dark";
        const nextTheme =
            currentTheme === "dark" ? "light" : "dark";

        setTheme(nextTheme);
        localStorage.setItem("theme", nextTheme);
    });
}
