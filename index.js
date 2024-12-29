const express = require("express");
const {admin, db} = require("./src/config/firebase_adminSDK_config");
const firebase = require("firebase");
require('firebase/auth');
const userRouter = require("./src/routes/userRoutes");
const itemRouter = require("./src/routes/itemRoutes");
const path = require('path');
const index = require("./src/config/algolia");
const cors = require('cors');


const app = express();

const corsOptions = {
  origin: '*', // Allow all origins
  methods: ['GET', 'POST'], // Specify allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
};

app.use(cors(corsOptions));


app.use(express.json());
app.use("/api/users", userRouter);
app.use("/api/items", itemRouter);

// Serve static files from the React app build folder
app.use(express.static(path.join(__dirname, '../CampingBazzar--WEB-/build')));


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

// Handle all other routes and serve the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../CampingBazzar--WEB-/build', 'index.html'));
});




async function addToAlgolia() {
  try {
    const snapshot = await db.collection('items').get();

    if (snapshot.empty) {
      console.log('No items found in Firestore.');
      return;
    }

    const data = snapshot.docs.map(doc => {
      const item = doc.data();
      return {
        objectID: doc.id,       // Use Firestore document ID as objectID
        userID : item.userID ,
        title: item.title,      // Extract title field
        category: item.category, // Extract category field
        description: item.description, // Extract description field
        price: item.price,      // Extract price field
        createdAt : item.createdAt,
        image : item.image
      };
    });

    // Save objects to Algolia
    const result = await index.saveObjects(data);
    console.log('Objects saved to Algolia:', result.objectIDs);
  } catch (err) {
    console.error('Error adding to Algolia:', err);
  }
}

// Execute the function
//addToAlgolia();

//Listen for changes in the articles collection
db.collection('items').onSnapshot((snapshot) => {
  snapshot.docChanges().forEach(change => {
    const data = change.doc.data();
    const objectID = change.doc.id;  
    if (change.type === 'added' || change.type === 'modified') {
      index.saveObject({
        ...data,
        objectID
      }).then(() => {
        console.log('Article indexed in Algolia:', objectID);
      });
    } else if (change.type === 'removed') {
      index.deleteObject(objectID).then(() => {
        console.log('Article removed from Algolia:', objectID);
      });
    }
  });
});


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
