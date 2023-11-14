const fs = require("fs");
const path = require("path");
const { Router } = require("express");
let router = Router();
const config = require("../../config.js");
const filesDir = path.resolve(__dirname, "../../", config.filesDir);

function formatFileSize(bytes) {
    const kilobyte = 1024;
    const megabyte = kilobyte * 1024;
    const gigabyte = megabyte * 1024;

    if (bytes < kilobyte) {
        return bytes + ' bytes';
    } else if (bytes < megabyte) {
        return (bytes / kilobyte).toFixed(2) + ' KB';
    } else if (bytes < gigabyte) {
        return (bytes / megabyte).toFixed(2) + ' MB';
    } else {
        return (bytes / gigabyte).toFixed(2) + ' GB';
    }
}

router.use((req, res, next) => {
    if (req.method != "GET") return next();
    if (req.path.startsWith("/api/files")) return next();
    let folderPath = path.join(filesDir, decodeURIComponent(req.path).slice(1).split("/").slice(1).join("/"));
    try {
        let stat = fs.statSync(folderPath)
        if (!stat.isDirectory()) throw new Error();
        res.json(fs.readdirSync(folderPath).map(file => {
            let filePath = path.join(folderPath, file);
            let stat = fs.statSync(filePath);
            return {
                directory: stat.isDirectory(),
                file: stat.isFile(),
                name: file,
                size: stat.size,
                sizeStr: formatFileSize(stat.size)
            }
        }));
    } catch (e) {
        res.sendStatus(404);
    }
})

module.exports = router