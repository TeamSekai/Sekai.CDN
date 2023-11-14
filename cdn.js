const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const ipRangeCheck = require("ip-range-check");
const multer = require("multer");
const config = require("./config.js");
const filesDir = path.resolve(__dirname, config.filesDir);
const prvDir = path.resolve(__dirname, config.prvDir);

app.set('trust proxy', 'uniquelocal')
app.use((req, res, next) => {
    const now = new Date();
    const clientIP = req.ip; // クライアントのIPを取得
    const requestInfo = `${req.method} ${decodeURIComponent(req.originalUrl)}`; // リクエストのメソッドとURL
    console.log(`[${now.toLocaleString()}] - Client IP: ${clientIP}, Request: ${requestInfo}`);
    next();
});

const storage = multer.diskStorage({
    destination: filesDir,
    filename(req, file, cb) {
        const originalname = file.originalname;
        const extname = path.extname(originalname);
        const basename = path.basename(originalname, extname);
        const uploadDir = filesDir;
        const files = fs.readdirSync(uploadDir);
        let newFileName = originalname;
        let count = 1;
        while (files.includes(newFileName)) {
            newFileName = `${basename}_${count}${extname}`;
            count++;
        }
        cb(null, newFileName);
    },
});
let upload = multer({
    storage: storage
}).single("file");




app.use("/upload", (req, res) => {
    if (req.method != "POST") {
        return res.status(403).send(fs.readFileSync(path.join(__dirname, 'assets', 'denied.html'), "utf8"));
    }
    let check = ipRangeCheck(req.ip, [
        "127.0.0.1/8",//ループバックアドレス
        "::1/128",//ループバックアドレス(IPv6)
        "10.0.0.0/8",//プライベートIP
        "172.16.0.0/12",//プライベートIP
        "192.168.0.0/16",//プライベートIP
        "fc00::/7",//プライベートIP(IPv6)
        ...config.trustedIPs
    ]);
    if (!check) {
        return res.status(403).send(fs.readFileSync(path.join(__dirname, 'assets', 'denied.txt'), "utf8"));
    }
    upload(req, res, (err) => {
        if (err) {
            res.status(500).send({
                success: false,
                error: "Failed to Upload"
            });
            console.error("error", err);
            return;
        }
        let url = path.relative(filesDir, req.file.path);
        res.status(200).send({
            success: true,
            fileName: url
        });
    });
})

const storage2 = multer.diskStorage({
    destination: prvDir,
    filename(req, file, cb) {
        const originalname = file.originalname;
        const extname = path.extname(originalname);
        const basename = path.basename(originalname, extname);
        const uploadDir = prvDir;
        const files = fs.readdirSync(uploadDir);
        let newFileName = originalname;
        let count = 1;
        while (files.includes(newFileName)) {
            newFileName = `${basename}_${count}${extname}`;
            count++;
        }
        cb(null, newFileName);
    },
});
let prvupload = multer({
    storage: storage2
}).single("file");

app.use("/prvupload", (req, res) => {
    if (req.method != "POST") {
        return res.status(403).send(fs.readFileSync(path.join(__dirname, 'assets', 'denied.html'), "utf8"));
    }
    let check = ipRangeCheck(req.ip, [
        "127.0.0.1/8",//ループバックアドレス
        "::1/128",//ループバックアドレス(IPv6)
        "10.0.0.0/8",//プライベートIP
        "172.16.0.0/12",//プライベートIP
        "192.168.0.0/16",//プライベートIP
        "fc00::/7",//プライベートIP(IPv6)
        ...config.trustedIPs
    ]);
    if (!check) {
        return res.status(403).send(fs.readFileSync(path.join(__dirname, 'assets', 'denied.txt'), "utf8"));
    }
    prvupload(req, res, (err) => {
        if (err) {
            res.status(500).send({
                success: false,
                error: "Failed to Upload"
            });
            console.error("error", err);
            return;
        }
        let url = path.relative(prvDir, req.file.path);
        res.status(200).send({
            success: true,
            fileName: url
        });
    });
})

app.use("/", require("./Routes"))


app.get("/private/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(prvDir, filename);

    // ファイルが存在するかを確認
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        // ファイルが存在しない場合、404エラーを送信
        res.status(404).sendFile(path.join(__dirname, 'assets', '404.png'));
    }
});

app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'assets', '404.png'));
});

app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).send('ﾃﾞｭｱｳﾝ...')
})

app.listen(config.port, () => {
    console.log(`${config.port}でListen中`);
});