import fs from "fs";
import path from "path";
import express from "express";
let router = express.Router();
import { config, getDirectoryEntries } from "@packages/common";
const filesDir = path.resolve(import.meta.dirname, "../../", config.filesDir);
const prvDir = path.resolve(import.meta.dirname, "../../", config.prvDir);
import passport from 'passport';
import passportHttp from 'passport-http';
import fileUpload from "express-fileupload";
import ipRangeCheck from "ip-range-check";

router.use(fileUpload({

}));

router.use(async (req, res, next) => {
    if (req.method != "GET") return next();
    if (req.path.startsWith("/api/files")) return next();
    try {
        res.json(await getDirectoryEntries(decodeURIComponent(req.path).slice(1).split("/").slice(1).join("/")));
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
    let file = req.files?.file;
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


export default router