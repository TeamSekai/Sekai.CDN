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
    console.log(`[${now.toLocaleString()}] - Client IP: ${clientIP}, Request: ${requestInfo}`);
    next();
});


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