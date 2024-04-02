import fs from "fs";
import path from "path";
import express from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yaml";
const router = express.Router();
import { config } from "@packages/common";
import apiRouter from "./api/index.js";
import { handler as astroHandler } from "@packages/astro";
import send from "send";

const swaggerDoc = YAML.parse(fs.readFileSync(path.join(import.meta.dirname, "../", "docs", "openapi.yml"), "utf8"));
router.use("/api-doc", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

router.use("/api", apiRouter);

router.get('/webupload', function (req, res) {
    res.status(200).send('HELLO')
})

router.use(express.static(path.resolve(import.meta.dirname, "../", config.filesDir)));

router.use("/", express.static(path.join(import.meta.dirname, "../", "packages", "astro", "dist", "client")));
router.use(astroHandler);

export default router