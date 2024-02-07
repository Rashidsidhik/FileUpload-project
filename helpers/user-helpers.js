let db= require('../config/connection');
let collection= require('../config/collections')
const bcrypt = require('bcrypt');
module.exports ={
    registerUser:(userData)=>{
        // console.log(userData);
        return new Promise(async(res,rej)=>{
            userData.password = await bcrypt.hash(userData.password,10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                res(userData);

            })
        })

    },
    loginUser:(userData)=>{
        return new Promise(async (res,rej)=>{
            let loginStatus=false;
            let response= {};
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
            if(user)
            {
                bcrypt.compare(userData.password,user.password).then((status)=>{
                    if(status)
                    {
                        console.log("login success")
                        response.user= user;
                        response.status=true;
                        res(response);
                    }
                    else{
                        console.log("login failed")
                        res({status:false})
                    }
                })
            }
            else
            {
                console.log("login failed");
                res({status:false});
            }
        })
    },
    checkEmail: async (email) => {
        try {
            const collectionExists = await db.get().listCollections({ name: collection.USER_COLLECTION }).hasNext();
            
            if (!collectionExists) {
                await db.get().createCollection(collection.USER_COLLECTION);
                console.log(`Collection '${collection.USER_COLLECTION}' created.`);
            }
    
            let checkedEmail = await db.get().collection(collection.USER_COLLECTION).findOne({ email: email });
            
            console.log('Email check:', checkedEmail);
            
            return checkedEmail;
        } catch (error) {
            console.error('Error checking email:', error);
            throw error;
        }
    }
    

}