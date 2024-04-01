import fs from "fs";
import path from "path";
import express from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yaml";
const router = express.Router();
import config from "../config.js";
import apiRouter from "./api/index.js";
import { handler as astroHandler } from "@packages/astro";
import send from "send";
const filesDir = path.resolve(import.meta.dirname, "../", config.filesDir);

const swaggerDoc = YAML.parse(fs.readFileSync(path.join(import.meta.dirname, "../", "docs", "openapi.yml"), "utf8"));
router.use("/api-doc", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

router.use("/api", apiRouter);

router.get('/webupload', function (req, res) {
    res.status(200).send('HELLO')
})

router.use(express.static(path.join(import.meta.dirname, "../", "files")))

router.use("/", express.static(path.join(import.meta.dirname, "../", "packages", "astro", "dist", "client")));
router.use(astroHandler);

router.use((req, res, next) => {
    if (req.method != "GET") return next();
    res.send(fs.readFileSync(path.join(import.meta.dirname, "../", "html", "index.html"), "utf8"))
})

export default router