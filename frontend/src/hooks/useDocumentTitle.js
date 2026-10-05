import { useEffect } from "react";

const BASE_TITLE = "Cinephile";

/**
 * Custom hook to dynamically update document.title
 * @param {string} title - The title to display for this page
 * @param {boolean|object} options - Suffix boolean or config { suffix = true, separator = " - ", restoreOnUnmount = false }
 */
export function useDocumentTitle(title, options = {}) {
    useEffect(() => {
        const prevTitle = document.title;
        const config = typeof options === "boolean" ? { suffix: options } : options;
        const { suffix = true, separator = " - ", restoreOnUnmount = false } = config;

        if (!title) {
            document.title = BASE_TITLE;
        } else if (suffix) {
            document.title = `${title}${separator}${BASE_TITLE}`;
        } else {
            document.title = title;
        }

        return () => {
            if (restoreOnUnmount) {
                document.title = prevTitle;
            }
        };
    }, [title, options]);
}

export default useDocumentTitle;
