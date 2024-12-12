const userSchema = require('../models/user');
const { db } = require('../config/firebase_adminSDK_config');
const { Timestamp } = require('firebase-admin').firestore;

async function signIn(req, res) {
    try {
        console.log('Someone is calling the api ........')
        const userID = req.user.user_id; // Extract userID from authenticated token
        
        const userRef = db.collection('users').doc(userID);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            // If user already exists, return their data
            return res.status(200).send({ 
                message: "User signed in.", 
                user: userDoc.data() 
            });
        } else {
            // Validate incoming user data
            const { error, value } = userSchema.validate(req.body, { abortEarly: true });
            if (error) {
                return res.status(400).send({
                    message: "Validation errors",
                    details: error.details.map((err) => err.message),
                });
            }
           

            // Extract validated data
            const email = req.user.email;
            if (req.user.firebase.sign_in_provider === "google.com"){
                value.username = req.user.name ;
            }

            // Create new user data
            const userData = {...value,
                userID: userID,
                email: email,
                createdAt : Timestamp.now()
            };

            // Save the user data in Firestore
            await userRef.set(userData);

            return res.status(201).send({
                message: "User created and signed in successfully.",
                user: userData,
            });
        }
    } catch (error) {
        return res.status(500).send({
            message: "An error occurred during sign-in.",
            error: error.message,
        });
    }
}
async function login(req,res) {
    try {
        
    } catch (error) {
        
    }
}

module.exports = { signIn };
