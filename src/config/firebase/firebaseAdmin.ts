import admin from "firebase-admin";
import path from "path";

if (!admin.apps.length) {
  const accountPath = path.resolve(__dirname, "firebaseServiceAccount.json");

  admin.initializeApp({
    credential: admin.credential.cert(accountPath),
  });
}

export default admin;
