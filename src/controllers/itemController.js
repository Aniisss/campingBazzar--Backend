const { db, admin } = require('../config/firebase_adminSDK_config');
const itemSchema = require('../models/item'); 
const { GeoFirestore } = require('geofirestore'); 
const { Timestamp } = require('firebase-admin').firestore;
const { BlobServiceClient } = require('@azure/storage-blob');

const geo = new GeoFirestore(db);
const geoFirestore = geo.collection("items");

// Azure Blob Storage setup
const AZURE_CONNECTION_STRING = 'DefaultEndpointsProtocol=https;AccountName=campigngbazzar;AccountKey=MfwXKgK0CY6hnxQ5LbVNW/kSvDBHUvHfvZQmz3qohcaZibSNESJcIYo5JUCdztR4uory1k8tC3Rz+AStjmjodg==;EndpointSuffix=core.windows.net';
const containerName = 'items';

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(containerName);


// Create the article function
async function createItem(req, res) {
    try {

        console.log('Someone is creating an item .....');

        //extracting the location and deleting from request to validate without location
        const location = req.body.location ; 
        delete req.body.location;

        const userID = req.user.user_id;

        // Validate request body
        const { error, value} = itemSchema.validate(req.body, { abortEarly: true });
        if (error) {
            console.log(error);
            return res.status(400).json({ error: error.details[0].message });
        }

        const itemRef = db.collection("items").doc();
        const itemID = itemRef.id;

        // Create the article document with geospatial data
        await geoFirestore.doc(itemID).set({
          ...value,
          itemID : itemID ,
          userID : userID ,
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

async function uploadImage(req, res) {
  try {
    const filePath = req.file.path;

    // Generate a unique blob name by appending a timestamp to the original file name
    const timestamp = Date.now(); // Get the current timestamp in milliseconds
    const blobName = `${timestamp}_${req.file.originalname}`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Upload the image to Azure Blob Storage
    const uploadBlobResponse = await blockBlobClient.uploadFile(filePath);

    // Generate the URL for the uploaded image
    const imageUrl = `https://${blobServiceClient.accountName}.blob.core.windows.net/${containerName}/${blobName}`;

    // Return success response with image URL
    res.status(200).json({
      message: "Image uploaded successfully!",
      imageUrl: imageUrl
    });

  } catch (error) {
    console.error('Error uploading to Azure:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
}

async function getItems(req ,res){
  try {
    const itemsCollection = db.collection('items');
    const snapshot = await itemsCollection.get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'No items found' , items : []});
    }

    // Map through the documents and extract only the attributes needed
    const items = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        itemID: doc.id, // Optionally include the document ID
        title: data.title || '', // Replace with your attribute names
        userID: data.userID || '',
        price: data.price || 0,
        imageUrl: data.imageUrl || '',
        description: data.description || '',
      };
    });

    return res.status(200).json({ message: 'Items retreived successfully !' , items : items}); // Send the items as a JSON response

  } catch (error) {
    console.error('Error fetching items:', error);
    return res.status(500).json({ message: 'Failed to fetch items', error: error.message });
  }
}

module.exports = {createItem , uploadImage  , getItems};