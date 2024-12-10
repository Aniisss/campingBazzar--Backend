const express = require("express");
const {admin, db} = require("./src/config/firebase_adminSDK_config");
const firebase = require("firebase");
require('firebase/auth');
const userRouter = require("./src/routes/userRoutes");
const itemRouter = require("./src/routes/itemRoutes")

const app = express();


app.use(express.json());
app.use("/api/users", userRouter);
app.use("/api/items", itemRouter)


const firebaseConfig = {
  apiKey: "AIzaSyC3PGPKDqmTSNiG7POgvNu2KMkPvVSdX1M",
  authDomain: "campingbazzar.firebaseapp.com",
  projectId: "campingbazzar",
  storageBucket: "campingbazzar.firebasestorage.app",
  messagingSenderId: "632190892128",
  appId: "1:632190892128:web:531aebe3143df15807ab05",
  measurementId: "G-3QXD8V0VVE"
};


firebase.initializeApp(firebaseConfig) ;





async function signInWithEmailAndPassword() {
  try {
    // Authenticate with Firebase
    const userCredential = await firebase.auth().signInWithEmailAndPassword("anis.nsir@supcom.tn","password");

    // Get the ID token
    const idToken = await userCredential.user.getIdToken();
    console.log(idToken) ;
  } catch (error) {
    throw new Error(`Authentication failed: ${error.message}`);
  }
}


signInWithEmailAndPassword();



const PORT = 3000;
app.listen(PORT, '0.0.0.0' ,() => {
  console.log(`Server is listening on http://localhost:${PORT} .....`);
});

/* my-express-app/
├── src/
│   ├── config/               # Configuration files (e.g., environment variables, database)
│   │   └── firebase-config.js
│   │
│   ├── controllers/          # Route handler logic (business logic)
│   │   └── userController.js
│   │
│   ├── middlewares/          # Custom middleware
│   │   └── authMiddleware.js
│   │
│   ├── models/               # Database models/schema definitions
│   │   └── userModel.js
│   │
│   ├── routes/               # Application routes
│   │   └── userRoutes.js
│   │
│   ├── services/             # Service logic (e.g., external APIs, Firebase interactions)
│   │   └── userService.js
│   │
│   ├── utils/                # Utility/helper functions
│   │   └── logger.js
│   │
│   └── app.js                # Main app configuration
│
├── .env                      # Environment variables
├── package.json              # Node.js project metadata
├── package-lock.json         # Lockfile for dependencies
├── README.md                 # Documentation
└── server.js                 # Server entry point */
