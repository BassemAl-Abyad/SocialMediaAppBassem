import admin from "firebase-admin";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const serviceAccount = JSON.parse(
  readFileSync(resolve("./src/config/social-app-bassem-firebase-adminsdk-fbsvc-b00798e0ed.json"), "utf-8")
);

const firebaseApp = admin.apps.length > 0 ? admin.app() : admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

export default firebaseApp;