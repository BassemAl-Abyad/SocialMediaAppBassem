import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const serviceAccount = JSON.parse(
  readFileSync(resolve("./src/config/social-app-bassem-firebase-adminsdk-fbsvc-b00798e0ed.json"), "utf-8")
);

const firebaseApp = getApps().length > 0 ? getApp() : initializeApp({
  credential: cert(serviceAccount)
});

export default firebaseApp;