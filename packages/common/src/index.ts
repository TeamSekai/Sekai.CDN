import fs from "fs";
import path from "path";

export const config = {
    filesDir: "files",
    prvDir: "private",
    port: 8080,
    trustedIPs: [],
    uploadUserName: "admin",
    uploadPassword: "password",
    useXffHeader: false,
    ...JSON.parse(
        fs.readFileSync(
            path.join(import.meta.dirname, "../", "../", "../", "config.json"),
            "utf-8"
        )
    )
};
