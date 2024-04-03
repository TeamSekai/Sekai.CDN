import path from "path";
import url from "url";

export * from "./config.js";
export * from "./files.js";

if (!("dirname" in import.meta)) {
    Object.defineProperty(import.meta, "dirname", {
        get: function dirname() {
            return path.dirname(url.fileURLToPath(import.meta.url));
        }
    })
}
