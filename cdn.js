const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const config = require("./config.js");

app.set('trust proxy', 'uniquelocal')
app.use((req, res, next) => {
    const now = new Date();
    const clientIP = req.ip; // クライアントのIPを取得
    const requestInfo = `${req.method} ${decodeURIComponent(req.originalUrl)}`; // リクエストのメソッドとURL
	const userAgent = req.headers['user-agent'];
	console.log(userAgent)
    console.log(`[${now.toLocaleString()}] - Client IP: ${clientIP}, Request: ${requestInfo}`);
	let logPath = path.join(__dirname, "access.log");
	if (!fs.existsSync(logPath))
		fs.writeFileSync(logPath, "CDN Access log\n");
	fs.appendFileSync(logPath, `[${now.toLocaleString()}] - Client IP: ${clientIP}, Request: ${requestInfo}, UA: ${userAgent}\n`)

    next();
});

app.get("/private/:filename", (req, res) => {
    const filename = req.params.filename;
    const prvDir = config.prvDir
    const filePath = path.join(__dirname, prvDir filename);

    // ファイルが存在するかを確認
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        // ファイルが存在しない場合、404エラーを送信
        res.status(404).sendFile(path.join(__dirname, 'assets', '404.png'));
    }
});

app.use("/", require("./Routes"))

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
