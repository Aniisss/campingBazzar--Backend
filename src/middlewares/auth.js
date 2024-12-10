
// This middleware will verify the Token sent inside the header of each request that require authentication

const {admin} = require('../config/firebase_adminSDK_config'); 

async function authenticate(req, res ,next){
    try{
        const authHeader = req.headers.authorization ;
        if (!authHeader){
            return res.status(401).send({message : "Unauthorised !!!"}) ;
        }
    
        const token = authHeader.split(' ')[1];

        const decodedToken = await admin.auth().verifyIdToken(token); 
        req.user = decodedToken ;
        next(); 
    } catch (error) {
        console.log('error')
        res.status(401).send({message : "Unauthorised !!!!!"}) ;
    }

}

module.exports = authenticate ;