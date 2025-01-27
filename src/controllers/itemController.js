const { db, admin } = require('../config/firebase_adminSDK_config');
const itemSchema = require('../models/item'); 
const { GeoFirestore } = require('geofirestore'); 
const { Timestamp } = require('firebase-admin').firestore;
const { BlobServiceClient } = require('@azure/storage-blob');
const index = require('../config/algolia');

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

async function getItems(req, res) {
  try {
    const itemsCollection = db.collection('items');
    const usersCollection = db.collection('users');  // Reference to the 'users' collection

    //check if the item is liked by the authenticated user 
    const authUserID = req.headers['user_id'] ? req.headers['user_id'] : '';

    // Query to get items sorted by the 'createdAt' field in descending order (latest first)
    const snapshot = await itemsCollection.orderBy('createdAt', 'desc').get();

    if (snapshot.empty) {
      return res.status(200).json({ message: 'No items found', items: [] });
    }

    // Create an array to hold the items with the user's name
    const items = [];

    // Loop through the items and fetch the user data based on userID
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const userID = data.userID || '';

      // Fetch the user document by userID
      const userDoc = await usersCollection.doc(userID).get();

      //initialize isLiked variable
      let isLiked ;

      if (userDoc.exists) {
        const userData = userDoc.data();
        const userName = userData?.userName || 'Unknown'; // Use 'Unknown' if no username is found
        const email = userData?.email || 'Unknown' ;
        // Checking if the article is liked by the authUser
        const favouriteDoc = await db
          .collection("favourites")
          .where("userID", "==", authUserID)
          .where("itemID", "==", doc.id)
          .get();
        if (favouriteDoc.size == 1) {
          isLiked = true; 
        } else {
          isLiked = false
        }
        items.push({
          itemID: doc.id, // Optionally include the document ID
          title: data.title || '', // Replace with your attribute names
          userName: userName, // Adding the userName here
          email : email, 
          userID: userID,
          price: data.price || 0,
          image: data.image || '',
          category: data.category,
          description: data.description || '',
          createdAt: data.createdAt || Date.now(), // Ensure 'createdAt' is included
          isLiked : isLiked
        });
      } else {
        // If user does not exist, push the item with a placeholder name
        items.push({
          itemID: doc.id,
          title: data.title || '',
          userName: 'Unknown User',
          userID: userID,
          price: data.price || 0,
          image: data.image || '',
          category: data.category,
          description: data.description || '',
          createdAt: data.createdAt || Date.now(),
        });
      }
    }

    return res.status(200).json({ message: 'Items retrieved successfully!', items: items });

  } catch (error) {
    console.error('Error fetching items:', error);
    return res.status(500).json({ message: 'Failed to fetch items', error: error.message });
  }
}

async function addFavourite(req, res) {
  try {
    const userID = req.user.user_id;
    const itemID = req.params.itemID;

    // Checking if the article is already added by the user
    const favouriteDoc = await db
      .collection("favourites")
      .where("userID", "==", userID)
      .where("itemID", "==", itemID)
      .get();
    if (favouriteDoc.size == 1) {
      // Deleting the favourite document (dislike)
      const batch = db.batch();
      batch.delete(favouriteDoc.docs[0].ref);
      await batch.commit();
      return res.status(200).send({ message: "item removed successfully" });
    }
    // Creating the favourite Document with added article
    const favouriteRef = db.collection("favourites").doc();
    await favouriteRef.set({
      userID: userID,
      itemID: itemID,
    });

    res.status(200).send({ message: "Item Added successfully " });
  } catch (error) {
    res.status(500).send({ message: "internal server error", error: error });
  }
}


async function getFavourites(req, res) {
  try {
    const authUserID = req.user.user_id; // Retrieve authenticated user ID from the request header

    const favouritesCollection = db.collection('favourites');
    const itemsCollection = db.collection('items');

    // Query to get all favorites for the authenticated user
    const favouritesSnapshot = await favouritesCollection
      .where("userID", "==", authUserID)
      .get();

    if (favouritesSnapshot.empty) {
      return res.status(200).json({ message: "No favourites found", items: [] });
    }

    const favouriteItems = [];

    // Loop through the favourites to fetch item details
    for (const favouriteDoc of favouritesSnapshot.docs) {
      const favouriteData = favouriteDoc.data();
      const itemID = favouriteData.itemID;

      // Fetch the item details from the items collection
      const itemDoc = await itemsCollection.doc(itemID).get();
      if (itemDoc.exists) {
        const itemData = itemDoc.data();
        favouriteItems.push({
          itemID: itemID, // Include the document ID
          title: itemData.title || '',
          price: itemData.price || 0,
          image: itemData.image || '',
          category: itemData.category || '',
          description: itemData.description || '',
          createdAt: itemData.createdAt || Date.now(),
          isLiked : true
        });
      }
    }

    return res.status(200).json({
      message: "Favourites retrieved successfully!",
      items: favouriteItems,
    });
  } catch (error) {
    console.error("Error fetching favourites:", error);
    return res.status(500).json({ message: "Failed to fetch favourites", error: error.message });
  }
}


async function search (req, res) {
  try {
    const keyword = req.query.keyword || ''; // Get search keyword from query parameters
    const authUserID = req.headers['user_id'] ?  req.headers['user_id'] : '';
  

    if (!keyword) {
      return res.status(400).json({ message: 'Keyword is required' });
    }

    // Perform a search on Algolia
    const searchResults = await index.search(keyword, {
      attributesToRetrieve: ['objectID', 'userID', 'title', 'price', 'image', 'category', 'description', 'createdAt'],
      hitsPerPage: 20, // Limit the number of results per page
    });

    if (!searchResults.hits.length) {
      return res.status(200).json({ message: 'No items found', items: [] });
    }

    const items = [];

    // Process each hit and retrieve user data
    for (const hit of searchResults.hits) {
      let isLiked ;

      const userDoc = await db.collection('users').doc(hit.userID).get();
      const userData = userDoc.data();
      const userName = userData?.userName


      const favouriteDoc = await db
          .collection("favourites")
          .where("userID", "==", authUserID)
          .where("itemID", "==", hit.objectID)
          .get();
        if (favouriteDoc.size == 1) {
          isLiked = true; 
        } else {
          isLiked = false
        }

    
      // Add the formatted item to the response array
      items.push({
        itemID: hit.objectID,
        title: hit.title || '',
        userName: userName,
        userID: hit.userID,
        price: hit.price || 0,
        image: hit.image || '',
        category: hit.category || '',
        description: hit.description || '',
        createdAt: hit.createdAt || Date.now(),
        isLiked: isLiked,
      });
    }

    return res.status(200).json({ message: 'Search results retrieved successfully!', items: items });
  } catch (error) {
    console.error('Error performing search:', error);
    return res.status(500).json({ message: 'Failed to perform search', error: error.message });
  }

};


module.exports = {createItem , uploadImage  , getItems , addFavourite, getFavourites , search};