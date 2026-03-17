const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function syncUsers() {
  const listUsersResult = await admin.auth().listUsers();

  for (const user of listUsersResult.users) {
    const userRef = db.collection("users").doc(user.uid);
    const doc = await userRef.get();

    if (!doc.exists) {
      console.log("Adding user:", user.email);

      await userRef.set({
        name: user.displayName || "No Name",
        email: user.email || "",
        isAdmin: false,
        cart: [],
        createdAt: new Date().toISOString(),
      });
    } else {
      console.log("Already exists:", user.email);
    }
  }

  console.log("Sync complete");
}

syncUsers().catch(console.error);