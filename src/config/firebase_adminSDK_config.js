var admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");

var serviceAccount = require("./service_acoount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = getFirestore()
module.exports = {admin , db } ;