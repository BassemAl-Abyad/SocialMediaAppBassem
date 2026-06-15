"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("firebase-admin/app");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const serviceAccount = JSON.parse((0, node_fs_1.readFileSync)((0, node_path_1.resolve)("./src/config/social-app-bassem-firebase-adminsdk-fbsvc-b00798e0ed.json"), "utf-8"));
const firebaseApp = (0, app_1.getApps)().length > 0 ? (0, app_1.getApp)() : (0, app_1.initializeApp)({
    credential: (0, app_1.cert)(serviceAccount)
});
exports.default = firebaseApp;
