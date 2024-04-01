import config from "./config.json" assert { type: "json" };

export default {
    filesDir: "files",
    prvDir: "private",
    port: 8080,
    trustedIPs: [],
    uploadUserName: "admin",
    uploadPassword: "password",
    useXffHeader: false,
    ...config
};