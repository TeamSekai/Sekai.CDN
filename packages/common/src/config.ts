import fs from "fs";

export const config = {
    filesDir: "files",
    prvDir: "private",
    port: 8080,
    trustedIPs: [],
    uploadUserName: "admin",
    uploadPassword: "password",
    useXffHeader: false,
	gtagID: ""
};

Object.assign(
    config,
    JSON.parse(fs.readFileSync("./config.json", "utf-8"))
);
