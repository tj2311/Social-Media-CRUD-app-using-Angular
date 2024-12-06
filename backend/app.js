const { json } = require('body-parser');
const express = require('express');
const fs = require('fs');
const { resourceLimits } = require('worker_threads');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');
const jwt = require('jsonwebtoken')

const app = express();

app.set('view engine','ejs');
app.set('views', path.join(__dirname,'views'))
app.use(express.urlencoded({extended:true})) // converts 
app.use(express.json());
app.use(cors());

app.get("/",(req,res) => {
    res.render("main")
})
app.post("/auth/register",registerNewUser);
app.post("/auth/login", loginUser);
app.use(checkToken);
app.get("/auth/refreshToken", refreshToken);

app.get("/user/users",getUsers); 
app.get("/user/userSelf",getSingleUser);
app.get("/user/userSingle/:userId",getSingleUser);


// app.post("/user/addUser",addNewUser);

app.put("/user/editUser",editUser);
app.delete("/user/deleteUser/:userId",deleteUser)
app.get("/user/userSearch/:searchText",getSearchedUser);

app.get("/post/posts/:filterList/:userId",getPosts);
app.get("/post/posts/:filterList/",getPosts);
app.post("/post/editPost",addorEditPosts);
app.delete("/post/deletePost/:postId",deletePost);


app.listen(3000, () => {
    console.log("listening on port 3000")
})


function getPosts(req,res){
    fs.readFile("posts.json",{encoding: "utf-8"},(err, result) => {
        
        let postList = JSON.parse(result)
        let userId = +req.user.userId;

        if (req.params?.userId){ // to get posts for a specific user (not Self)
            userId = +req.params.userId 
        }

        let filterList = req.params.filterList === "true";

        if(filterList === true){ // if filterlist is false we get all the posts
            postList = postList.filter(row => {
                return row.userId === userId
            })
        }

        res.send(postList)
    })
}

function addorEditPosts(req,res){
    fs.readFile("posts.json",{encoding: "utf-8"},(err, result) => {
        let newPost = req.body;
        newPost.userId = +req.user.userId
        let postList = JSON.parse(result)

        if (newPost.postId){ // editing an existing post
            let postBeforeUpsert = postList.filter(row => {
                return row.postId === newPost.postId
            })[0];
            

            if (postBeforeUpsert.userId !== +req.user.userId){
                return res.status(401).send({"message":"You can only edit your own posts"})
            }

            newPost.postDate = postBeforeUpsert.postDate

            postList = postList.filter(row => {
                return row.postId !== newPost.postId
            })
        } else { // adding a new post

            postList.sort((a,b) => {
                return a.postId > b.postId ? 1 : -1;
            })
    
            let latestPostId = postList[postList.length -1].postId        
            newPost.postId = latestPostId + 1;
            newPost.postDate = new Date();
        }

        newPost.updateDate = new Date();

        postList.push(newPost);

        writeToFile('posts.json',JSON.stringify(postList)).then(() => {
            res.send(newPost);
        })

        
    })
}

function deletePost(req,res) {

    fs.readFile("posts.json",{encoding: "utf-8"},(err, result) => {
        let postList = JSON.parse(result);
        let postId = +req.params.postId;
        console.log('in the delete method')
        
        let postForDeletion = postList.filter(row => {
            return row.postId === postId;
        })[0];

        if (postForDeletion.userId !== req.user.userId){
            return res.status(401).send({"message": "You can only delete your own post"})
        }

        postList = postList.filter(row => {
            return row.postId !== postId
        })

        writeToFile("posts.json",JSON.stringify(postList)).then(() => {
            res.send({"message": "Succesfully deleted post"} )
        })
    })

}

const tokenkey = "ofiwe082u42h028ieh4208hf42oi" 

function getUsers(req,res){
    fs.readFile("users.json",{encoding: "utf-8"},(err, result) => {
        let userList = JSON.parse(result)
        res.send(userList)
    })
}

function getSingleUser(req,res){
    fs.readFile("users.json",{encoding: "utf-8"},(err, result) => {
        let userList = JSON.parse(result)
        let userId = +req.user.userId;

        if (req.params?.userId){
            userId = +req.params.userId // converts req.params.userId to a string (it is a number in the json file)
        }
        let singleUser = userList.filter(row => {
            return row.userId === userId
        })[0]

        res.send(singleUser)
    })
}

function getSearchedUser(req,res){
    fs.readFile("users.json",{encoding: "utf-8"},(err, result) => {
        let userList = JSON.parse(result)
        let name = req.params.searchText; 
        let singleUser = userList.filter(row => {
            return row.fullName.toLowerCase().includes(name);
        })

        res.send(singleUser)
    })
}

function refreshToken(req,res){
    let username = req.user.username;
    createToken(username).then(tokenResponse => {
        res.send({"token": tokenResponse})
    })
}

// function addNewUser(req,res){
//     fs.readFile("users.json",{encoding: "utf-8"},(err, results) => {
//         let userList = JSON.parse(results)

//         let newUser = req.body;

//         let isUsernameUnique = userList.filter((row) =>{
//             return row.username === newUser.username
//         }).length === 0

//         if (isUsernameUnique){
//             userList.sort((a,b) => {
//                 return a.userId > b.userId ? 1 : -1
//             })
    
//             let latestUserId = userList[userList.length - 1].userId
//             newUser.userId = latestUserId + 1
//             userList.push(newUser)
    
//             writeToFile("users.json",JSON.stringify(userList)).then(didWriteToFile => {
//                 if(didWriteToFile){
//                     res.send({"message": "request was succesful"});
//                 }
//                 else {
//                     res.send({"message": "request failed to save"})
//                 }
//             })
//         }
//         else{
//             res.send("username is not unique")
//         }

        
//     })
// }

function registerNewUser(req,res){
    fs.readFile("users.json",{encoding: "utf-8"},(err, results) => {
        let userList = JSON.parse(results)        

        let {password,passwordConfirm,...newUser} = req.body

        let isUsernameUnique = userList.filter((row) =>{
            return row.username === newUser.username
        }).length === 0

        if (isUsernameUnique && (password === passwordConfirm)){
            let salt = crypto.randomBytes(8).toString("hex");
            getHash(password,salt).then(passwordHash => {
                let authObject = {
                    username: newUser.username,
                    passwordHash: passwordHash,
                    passwordSalt: salt
                }
                Promise.all([
                    addUserToFile(userList,newUser),
                    addAuthObjectToFile(authObject)
                ]).then(fileWriteResponse => {
                    if(fileWriteResponse[0] && fileWriteResponse[1]){ //filewrite response[0] is the response from addUser to File and [1] is the response from addAuthObject to file
                        res.send(fileWriteResponse[0]) 
                    }
                    else {
                        res.status(500).send({"message" : "failed to save registration to file"})
                    }
                })
           })
            // addUserToFile(userList,newUser)
        } else{
            if(password !== passwordConfirm){
                res.status(500).send({"message":"passwords do not match"})
            }
            else{
                res.status(500).send({"message":"username is not unique"})
            }
        }

        
    })
}   

function addAuthObjectToFile(newAuthObject){
    return new Promise(resolve => {
        
        fs.readFile("auth.json",{encoding: "utf-8"},(err, results) => {               
            let authList = JSON.parse(results)
            authList.push(newAuthObject)

            writeToFile("auth.json",JSON.stringify(authList)).then(didWriteToFile => {
                if(didWriteToFile){
                    resolve(newAuthObject);
                }
                else {
                    resolve(false);
                }
            })
        })
    })
}

function addUserToFile(userList,newUser){
    return new Promise(resolve => {
        userList.sort((a,b) => {
            return a.userId > b.userId ? 1 : -1
        })
    
        let latestUserId = userList[userList.length - 1].userId
        newUser.userId = latestUserId + 1
        userList.push(newUser)
    
        writeToFile("users.json",JSON.stringify(userList)).then(didWriteToFile => {
            if(didWriteToFile){
                resolve(newUser);
            }
            else {
                resolve(false)
            }
        })
    })
    

}

function getHash(password,salt){
    return new Promise(resolve => {
        let keyLength = 20;
        let iterations = 600000;
        crypto.pbkdf2(password,
            salt,
            iterations,keyLength,"sha512", (err,derivedKey) =>{
            if(err){
                console.log(err);
                resolve(err);
            }else{
               let hash = derivedKey.toString("hex"); //converts array of bytes into a hex string value
               resolve(hash);
            }
        })
    })
}

function updateAuthForUser(username, newUsername = ""){
    return new Promise(resolve => {
        fs.readFile("auth.json",{encoding: "utf-8"},(err, results) => {
            let authList = JSON.parse(results)
            let authListEdited = authList.filter(row => {
                return row.username.toLowerCase() !== username.toLowerCase()
            })

            // if there is a new username we will edit instead of deleting
            if(newUsername.length !== ""){
                let authForEdit = authList.filter(row => {
                    return row.username.toLowerCase() === username.toLowerCase()
                })[0]

                authForEdit.username = newUsername;
                authList.push(authForEdit)
            }

            let authListText = JSON.stringify(authListEdited);
            writeToFile("auth.json",JSON.stringify(authListText)).then(didWriteToFile => {
                 resolve(didWriteToFile)
            })

        })

    })
}

function editUser(req,res){
    let userForEdit = req.body;
    if (userForEdit.userId === req.user.userId){ // checkin whether you have persmission to edit user. Token info is in req.user

        fs.readFile("users.json",{encoding: "utf-8"},(err, results) => {
            let userList = JSON.parse(results)
    
            let userId = userForEdit.userId;
    
            let isUsernameUnique = userList.filter(row =>{
                return row.username === userForEdit.username && row.userId !== userId  
            }).length === 0
    
            if (isUsernameUnique){
                let userListEdited = userList.filter((row) =>{
                    return row.userId !== userId
                })
        
                userListEdited.push(userForEdit)
        
                userListEdited.sort((a,b) => {
                    return a.userId > b.userId ? 1 : -1
                })

                let usernameBeforeEdit = userList.filter(row =>{
                    return row.userId === userId  
                })[0].username;

                let fileWritePromises = [
                    writeToFile("users.json",JSON.stringify(userListEdited))
                ]

                // if username has changed then we write to auth file else this 
                if (usernameBeforeEdit !== userForEdit.username){
                    fileWritePromises.push(updateAuthForUser(usernameBeforeEdit,userForEdit.username))
                }
        
                Promise.all(fileWritePromises).then(didWriteToFile => {
                    if(didWriteToFile[0] && (didWriteToFile.length === 1 || didWriteToFile[1])){
                        res.send({"message": "request was succesful"});
                    }
                    else {
                        res.send({"message": "request failed to save"})
                    }
                })
            }
            else{
                console.log("edit did not save to backend")
            }
    
        })
    } else{
        res.status(401).send({"message": "Unauthorized: token is not valid you can only edit your own user"})
    }
}

function deleteUser(req,res){
    let userId = +req.params.userId;

    if (userId = req.user.userId){
        fs.readFile("users.json",{encoding: "utf-8"},(err, results) => {
            let userList = JSON.parse(results)
    
            let userListAfterDelete = userList.filter((row) =>{
                return row.userId !== userId
            })

            let usernameBeforeDelete = userList.filter(row => {
                return row.userId = userId;
            })[0].username
    
            Promise.all([
                writeToFile("users.json",JSON.stringify(userListAfterDelete)),
                updateAuthForUser(usernameBeforeDelete)
            ])
            .then(didWriteToFile => {
                if(didWriteToFile[0] && didWriteToFile[1]){
                    res.send({"message": "request was succesful"});
                }
                else {
                    res.send({"message": "request failed to save"})
                }
            })
        })
    } else {
        res.status(401).send({"message" : "You may only delete your own user"})
    }
}

function writeToFile(filename,filetext){
    return new Promise((resolve) =>{
        fs.writeFile(filename,filetext,(err) =>{
            if (err){
                console.log(err)
                resolve(false)
            }else{
                resolve(true)
            }
        })
    })
    
}

function loginUser(req, res){
    fs.readFile("auth.json",{encoding: "utf-8"},(err, results) => {               
        let authList = JSON.parse(results)
        // console.log(req.body)
        // console.log("hi")

        let username = req.body.username;
        let password = req.body.password;

        let relatedAuthObjects = authList.filter(row => {
            return row.username === username;
        })
        // console.log(username)
        if (relatedAuthObjects.length > 0){
            let authObject = relatedAuthObjects[0];
            getHash(password,authObject.passwordSalt).then(hashResponse => {
                if(hashResponse === authObject.passwordHash){
                    createToken(username).then(tokenResponse => {
                        res.send({"token" : tokenResponse});
                    })
                }
                else {
                    res.status(401).send({"message": "username and combination is invalid"});
                }
            })
        }
        else {
            res.status(401).send({"message" : "Username does not exist"});
        }
 



    })
}



function createToken(username){
    return new Promise(resolve => {

        fs.readFile("users.json",{encoding: "utf-8"},(err, result) => {
            let userList = JSON.parse(result)
            
              // converts req.params.userId to a string (it is a number in the json file)
    
            let singleUser = userList.filter(row => {
                return row.username.toLowerCase() === username.toLowerCase()
            })[0]
    
            let token = jwt.sign(
                {
                    username: singleUser.username,
                    userId: singleUser.userId,
                    fullName: singleUser.fullName,
                    favoriteColor: singleUser.favoriteColor,
                    version: 1
                },
                tokenkey,
                {// expiration time
                    expiresIn: "24h"
                }
            )
            
            resolve(token)
        })
    })
}

function checkToken(req,res,next){ // authorization middleware that checks if you have an appropriate token when sending a request
   if(req.method.toUpperCase() === "OPTIONS"){
    next();
   } else {
        if(req.headers.authorization && req.headers.authorization.toLowerCase().includes("bearer ") ){
            let token = req.headers.authorization.split(" ")[1];
            jwt.verify(token, tokenkey, (err, claims) => { // claims is just the token data which is the user data
                if(err){
                    res.status(401).send({"message": "Unauthorized: the token supplied is not valid"})
                }
                else{
                    // console.log(claims)
                    // console.log("this is our middleware")
                    req.user = claims
                    next();

                }
            })
        } else{
            res.status(401).send({"message" : "Unauthorized: you need a token to access this endpoint"})
        }
   }
}