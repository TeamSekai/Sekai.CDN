const fs = require("fs");
const path = require("path");
const express = require("express");
let router = express.Router();
const config = require("../../config.js");
const filesDir = path.resolve(__dirname, "../../", config.filesDir);
const prvDir = path.resolve(__dirname, "../../", config.prvDir);
const passport = require('passport');
const passportHttp = require('passport-http');
const fileUpload = require("express-fileupload");
const ipRangeCheck = require("ip-range-check");

router.use(fileUpload({

}));

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

function uploadFile(file, uploadDir) {
    return new Promise((resolve, reject) => {
        let filePath = path.join(uploadDir, file.name);
        let extName = path.extname(file.name);
        let baseName = path.basename(file.name, extName);
        let files = fs.readdirSync(uploadDir);
        let newFileName = file.name;
        let count = 1;
        while (files.includes(newFileName)) {
            newFileName = `${baseName}_${count}${extName}`;
            count++;
        }
        filePath = path.join(uploadDir, newFileName);
        let stream = fs.createWriteStream(filePath);
        stream.write(file.data);
        stream.end();
        stream.on('finish', () => {
            resolve({
                path: filePath
            });
        });
        stream.on('error', () => reject());
    })
}

passport.use(new passportHttp.BasicStrategy(
    function (username, password, done) {
        if (username == config.uploadUserName && password == config.uploadPassword) {
            return done(null, true);
        } else {
            return done(null, false);
        }
    }
));

function str2bool(str) {
    if (typeof str != 'string') {
        return Boolean(str);
    }
    try {
        var obj = JSON.parse(str.toLowerCase());
        return obj == true;
    } catch (e) {
        return str != '';
    }
}

router.post("/upload-discord", async (req, res) => {
    let file = req.files.file;
    if (!file) return res.status(400);
    let uploadDir = str2bool(req.query["private"]) ? prvDir : filesDir;
    if (!fs.existsSync(uploadDir)) return res.sendStatus(404);
    let check = ipRangeCheck(req.ip, [
        "127.0.0.1/8",//ループバックアドレス
        "::1/128",//ループバックアドレス(IPv6)
        "10.0.0.0/8",//プライベートIP
        "172.16.0.0/12",//プライベートIP
        "192.168.0.0/16",//プライベートIP
        "fc00::/7",//プライベートIP(IPv6)
        ...config.trustedIPs
    ]);
    if (!check) return res.sendStatus(403);

    try {
        let result = await uploadFile(file, uploadDir)
        res.status(200).send({
            fileName: path.basename(result.path)
        });
    } catch {
        res.status(500).send({
            success: false,
            error: "Failed to Upload"
        });
    }
});

router.post("/upload", passport.authenticate('basic', { session: false }), async (req, res) => {
    if (!req.query.path) return res.status(400);
    let file = req.files.file;
    if (!file) return res.status(400);
    let uploadDir = path.join(filesDir, decodeURIComponent(req.query.path));
    if (!fs.existsSync(uploadDir)) return res.sendStatus(404);
    try {
        let result = await uploadFile(file, uploadDir)
        res.status(200).send({
            fileName: path.basename(result.path)
        });
    } catch {
        res.sendStatus(500);
    }
})


module.exports = router