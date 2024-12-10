const itemSchema = require('../models/item')


// Create the article function
async function createItem(req, res) {
    try {
        // Validate request body
        const { error, value} = itemSchema.validate(req.body, { abortEarly: true });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        // Add the article to Firestore
        const docRef = firestore().collection('items').doc();
        const data = {
            itemID : docRef.id,
            ...value 

        }
        await docRef.set(object);

        return res.status(201).json({ message: 'Article created successfully', articleID:  docRef.id});
    } catch (err) {
        console.error('Error creating article:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = createItem;