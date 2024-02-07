let db = require('../config/connection');
let collection = require('../config/collections');
const { response } = require('express');
let objectId = require('mongodb').ObjectId

module.exports = {
    getAllUser: () => {
        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection(collection.USER_COLLECTION).find().toArray();
            resolve(users);
        })
    },
    deleteUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).deleteOne({ _id: objectId(userId) }).then((response) => {
                resolve();
            })
        })

    },
    deletePosts: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.POSTS_COLLECTION).deleteOne({ _id: objectId(userId) }).then(() => {
                resolve();
            })
        })

    },
    adminLogin: (adminData) => {
        return new Promise((async (resolve, reject) => {
            let response = {}
            var admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: adminData.email })
            if (admin) {
                if (adminData.password == admin.password) {
                    console.log('login successfull')
                    response.admin = admin;
                    response.status = true;
                    resolve(response)

                }
                else
                {
                    console.log("login error");
                    resolve({status:false});
                }

            }
            else {
                console.log("login failed");
                resolve({ status: false })
            }
        }))

    },
    editUser: (userId, userDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION)
                .updateOne({ _id: objectId(userId) }, {
                    $set: {
                        name: userDetails.name,
                        email: userDetails.email
                    }
                }).then(() => {
                    resolve();
                })
        })
    },
    getUserDetails: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) }).then((user) => {
                resolve(user)
            })
        })
    }
}