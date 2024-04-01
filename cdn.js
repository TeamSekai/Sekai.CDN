import express from "express";
import path from "path";
import fs from "fs";
const app = express();
import config from "./config.js";
import router from "./Routes/index.js";

app.set('trust proxy', 'uniquelocal')
app.use((req, res, next) => {
    const now = new Date();
    const clientIP = config.useXffHeader ? req.headers['x-forwarded-for'] : req.ip; // クライアントのIPを取得
    const requestInfo = `${req.method} ${decodeURIComponent(req.originalUrl)}`; // リクエストのメソッドとURL
	const userAgent = req.headers['user-agent'];
	console.log(userAgent)
    console.log(`[${now.toLocaleString()}] - Client IP: ${clientIP}, Request: ${requestInfo}`);
	let logPath = path.join(import.meta.dirname, "access.log");
	if (!fs.existsSync(logPath))
		fs.writeFileSync(logPath, "CDN Access log\n");
	fs.appendFileSync(logPath, `[${now.toLocaleString()}] - Client IP: ${clientIP}, Request: ${requestInfo}, UA: ${userAgent}\n`)

    next();
});

app.get("/private/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.resolve(import.meta.dirname, 'private', filename);

    // ファイルが存在するかを確認
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath, { root: '/' });
    } else {
        // ファイルが存在しない場合、404エラーを送信
        res.status(404).sendFile(path.join(import.meta.dirname, 'assets', '404.png'));
    }
});

app.use("/", router)

app.use((req, res, next) => {
    res.status(404).sendFile(path.join(import.meta.dirname, 'assets', '404.png'));
});

app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).send('ﾃﾞｭｱｳﾝ...')
})

app.listen(config.port, () => {
    console.log(`${config.port}でListen中`);
});
