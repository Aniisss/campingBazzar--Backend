const express = require("express");
const {admin} = require("./src/config/firebase_adminSDK_config");
const userRouter = require("./src/routes/userRoutes");
const itemRouter = require("./src/routes/itemRoutes")

const app = express();


app.use(express.json());
app.use("/api/users", userRouter);
app.use("/api/items", itemRouter)

const { initializeApp } = require("firebase/app");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");
const authenticate = require("./src/middlewares/auth");

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC3PGPKDqmTSNiG7POgvNu2KMkPvVSdX1M",
  authDomain: "campingbazzar.firebaseapp.com",
  projectId: "campingbazzar",
  storageBucket: "campingbazzar.firebasestorage.app",
  messagingSenderId: "632190892128",
  appId: "1:632190892128:web:19032accd48b3e5507ab05",
  measurementId: "G-XRCD41V4YH",
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
const auth = getAuth();

// Obtaining TokenID from firebase using the firebase_clientSDK

async function getToken() {
  const email = "anis.nsir@supcom.tn";
  const password = "password";
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;

  const token = await user.getIdToken();
  console.log("token :", token);
}



const PORT = 3000;
app.listen(PORT, () => {
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
