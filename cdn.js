const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const ipRangeCheck = require("ip-range-check");
const multer = require("multer");
const config = {
    filesDir: "files",
    port: 8080,
    trustedIPs: [],
    ...require("./config.json")
};
const filesDir = path.resolve(__dirname, config.filesDir);
const prvDir = path.resolve(__dirname, config.prvDir);

// convert
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

app.set('trust proxy', 'uniquelocal')
app.use((req, res, next) => {
    const now = new Date();
    const clientIP = req.ip; // クライアントのIPを取得
    const requestInfo = `${req.method} ${req.originalUrl}`; // リクエストのメソッドとURL
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

app.get("/", async (req, res) => {
    try {
        let files = fs.readdirSync(filesDir);
        const fileList = files.map(file => {
            const fileStat = fs.statSync(path.join(filesDir, file));
            return {
                name: file,
                isDirectory: fileStat.isDirectory(),
                size: formatFileSize(fileStat.size)
            };
        });
        const html = generateFileListHTML(fileList);
        res.send(html);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
})

function generateFileListHTML(files) {
    const listItems = files.map(file => {
        const itemName = file.isDirectory ? `${file.name}/` : file.name;
        return `<li><a href="${itemName}">${itemName}</a> (${file.size} bytes)</li>`;
    });

    return `
	  <!DOCTYPE html>
	  <html>
	  <head>
		<title>File List</title>
	  </head>
	  <body>
		<h1>File List</h1>
		<ul>
		  ${listItems.join('')}
		</ul>
	  </body>
	  </html>
	`;
}

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

app.use(express.static(filesDir)); //ファイル探してく

app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'assets', '404.png'));
});

app.use((err, req, res, next) => {
    res.status(500).send('ﾃﾞｭｱｳﾝ...')
})

app.listen(config.port, () => {
    console.log(`${config.port}でListen中`);
});