const express = require("express");
const {admin} = require("./src/config/firebase_adminSDK_config");
const userRouter = require("./src/routes/userRoutes");
const itemRouter = require("./src/routes/itemRoutes")

const app = express();


app.use(express.json());
app.use("/api/users", userRouter);
app.use("/api/items", itemRouter)





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
