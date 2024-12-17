const { db, admin } = require('../config/firebase_adminSDK_config');
const itemSchema = require('../models/item'); 
const { GeoFirestore } = require('geofirestore'); 
const { Timestamp } = require('firebase-admin').firestore;

const geo = new GeoFirestore(db);
const geoFirestore = geo.collection("items");


// Create the article function
async function createItem(req, res) {
    try {

        //extracting the location and deleting from request to validate without location
        const location = req.body.location ; 
        delete req.body.location;

        // Validate request body
        const { error, value} = itemSchema.validate(req.body, { abortEarly: true });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const itemRef = db.collection("items").doc();
        const itemID = itemRef.id;

        // Create the article document with geospatial data
        await geoFirestore.doc(itemID).set({
          ...value,
          itemID : itemID ,
          createdAt : Timestamp.now(),
          coordinates: new admin.firestore.GeoPoint(
            location.latitude,
            location.longitude
          ),
        });


        return res.status(201).json({ message: 'Item created successfully', itemID:  itemID});
    } catch (err) {
        console.error('Error creating article:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = createItem;