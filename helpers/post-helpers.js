
let db= require('../config/connection');
let collection= require('../config/collections')
let objectId = require('mongodb').ObjectId
module.exports={
    addPost:(post,callback)=>{
        //  console.log(post);
         db.get().collection(collection.POSTS_COLLECTION).insertOne(post).then((data)=>{
            callback(data.insertedId);
         })
    },
    viewPosts:(email)=>{
        return new Promise(async(res,rej)=>{
            let posts= await db.get().collection(collection.POSTS_COLLECTION).find({email:email}).toArray();
            res(posts);
        })
    },
    viewAllPosts:()=>{
        return new Promise(async(res,rej)=>{
            let posts= await db.get().collection(collection.POSTS_COLLECTION).find().toArray();
            res(posts);
        })

    },
    deletePost:(postId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.POSTS_COLLECTION).deleteOne({_id:objectId(postId)}).then((response)=>{
                console.log(response);
                resolve();
            })

        })
    },
    getPostDetails:(postId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.POSTS_COLLECTION).findOne({_id:objectId(postId)}).then((posts)=>{
                resolve(posts);
            })
        })
    },
    updatePosts:(postId,postDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.POSTS_COLLECTION)
            .updateOne({_id:objectId(postId)},{
                $set:{
                    name:postDetails.name,
                    message:postDetails.message
                }
            }).then((response)=>{
                resolve()
            })
        })
    }

}