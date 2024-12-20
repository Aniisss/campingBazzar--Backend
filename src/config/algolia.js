
const algoliasearch = require('algoliasearch'); 

// Replace with your Application ID and Admin API Key
const client = algoliasearch('WD4EN7SIS7', 'a37aaedb0727037bc850f98d531bf3f8');
const index = client.initIndex('items');

module.exports = index ;