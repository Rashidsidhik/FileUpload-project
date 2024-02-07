const { response } = require('express');
var express = require('express');
var router = express.Router();
let postHelpers = require('../helpers/post-helpers')
const userHelpers = require('../helpers/user-helpers')
let passwordMismatch = false;
let emailExists = false;

/* GET home page. */

router.get('/', function (req, res, next) {
  console.log(req.session.loggedIn + "loggedin2")
  if (req.session.loggedIn) {
    res.redirect('/home')
  }
  else if(req.session.adminLoggedIn)
  {
    res.redirect('/admin/adminHome');
  }
  else {
    res.render('users/login');
  }
});

router.get('/home', (req, res) => {
  let userLog = req.session.user;
  // let username= req.session.userName;
  // console.log("session stored");
  // console.log(userLog)
  if (userLog) {
    postHelpers.viewAllPosts().then((posts) => {
      res.render('users/home', { posts, user: true, userLog })
    })

  }
  else {
    res.redirect('/userLogin');
  }

})

router.route('/userLogin').
  get((req, res) => {
    console.log(req.session.loggedIn + "loggedin2")
    if (req.session.loggedIn) {
      res.redirect('/home');
    }
    else {
      res.render('users/login', { error: req.session.loginError })
      req.session.loginError = null;
    }
  }).
  post((req, res) => {
    // console.log(req.body)
    userHelpers.loginUser(req.body).then((response) => {
      if (response.status) {
        req.session.loggedIn = true;
        console.log(req.session.loggedIn + "loggedin")
        req.session.user = response.user;
        res.redirect('/home')
      } else {
        req.session.loginError = "invalid username or password";
        res.redirect('/userLogin')
      }
    })
  })

router.route('/userSignUp').
  get((req, res) => {
    if (req.session.loggedIn) {
      res.redirect('/home');
    }
    else if (passwordMismatch) {
      res.render('users/signup', { passwordMismatch: "Password missmatch" })
      passwordMismatch = false;
    }
    else if (emailExists) {
      res.render('users/signup', { emailExists: "Email already exists.." })
      emailExists = false;
    }
    else {
      res.render('users/signup')
    }
  }).
  post(async (req, res) => {

    await userHelpers.checkEmail(req.body.email).then((data) => {
      if (data !== null) {
        emailExists = true;
      }

    })
    // console.log(emailExists);

    let userData = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    }
    if (req.body.password !== req.body.confirmPassword) {
      passwordMismatch = true;
      res.redirect('/userSignUp');
    }
    else if (emailExists) {
      res.redirect('/userSignUp');
    }
    else {
      userHelpers.registerUser(userData).then((response) => {
        req.session.loggedIn = true;
        req.session.user = response
        res.redirect('/userLogin');
      })
    }
  })

router.route('/addPost').
  get((req, res) => {
    if (req.session.loggedIn) {
      let userLog = req.session.user;
      // console.log("userDetails...")
      // console.log(userLog)
      res.render('users/addpost', { user: true, userLog });
    }
  })
   router.post('/addPost', (req, res) => {
    let userLog = req.session.user;
    console.log("userDetails...")
    console.log(userLog)
    console.log("body");
    console.log(req.body);
    console.log("files");
    console.log(req.files); // Files will not be available directly in the request object
    
    // Process the uploaded file if available
    if (req.files && req.files.image) {
        let image = req.files.image;
        let imageName = image.name;
        let imagePath = './public/post-images/' + imageName;

        // Move the file to the specified path
        image.mv(imagePath, err => {
            if (err) {
                console.error("Error uploading file:", err);
                res.redirect('/home'); // Redirect or handle error appropriately
            } else {
                console.log("File uploaded successfully!");
                
                // Create the posts object with file details
                let posts = {
                    name: req.body.name,
                    message: req.body.message,
                    email: userLog.email,
                    imageName: imageName // Save the file name to the database
                };

                // Call postHelpers function to add the post
                postHelpers.addPost(posts, (objId) => {
                    res.redirect('/home');
                });
            }
        });
    } else {
        // If no file is uploaded, handle accordingly (e.g., show an error message)
        console.log("No file uploaded");
        res.redirect('/home'); // Redirect or handle error appropriately
    }
});


router.get('/myPosts', (req, res) => {
  if(req.session.loggedIn)
  {
    let userLog = req.session.user;
    let email = userLog.email;
    postHelpers.viewPosts(email).then((posts) => {
      res.render('users/myPosts', { user: true, userLog, posts });
  
    })
  }
 
})

router.get('/editPost', (req, res) => {
  let userLog = req.session.user;
  if(userLog)
  {
    let email=userLog.email;
    postHelpers.viewPosts(email).then((posts) => {
      res.render('users/viewPosts', { posts, user: true, userLog })
    })

  }

})

router.get('/updatePost/:id', async (req, res) => {
  let userLog = req.session.user;
  if(userLog)
  {
    let post = await postHelpers.getPostDetails(req.params.id)
    console.log(post);
    res.render('users/updatePosts', { user: true, userLog, post });

  }
 
})

router.post('/updatePost/:id', (req, res) => {
  postHelpers.updatePosts(req.params.id, req.body).then(() => {
    res.redirect('/editPost');
    if (req.files.image) {
      let image = req.files.image;
      let objId = req.params.id;
      image.mv('./public/post-images/' + objId + '.jpg');
    }
  })
})

router.get('/deletePost/:id', (req, res) => {
  let postId = req.params.id;
  // console.log(req.params);
  // console.log(req.query)
  // console.log(postId)
  postHelpers.deletePost(postId).then((response) => {
    res.redirect('/editPost');
  })
  console.log(postId)

})

router.get('/logout', (req, res) => {
  // req.session.loggedIn=false;
  req.session.destroy();
  res.redirect('/userLogin');
})
module.exports = router;
