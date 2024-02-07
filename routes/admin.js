var express = require('express');
var router = express.Router();
let postHelpers = require('../helpers/post-helpers')
let adminHelpers = require('../helpers/admin-helpers');

/* GET users listing. */
router.get('/', function (req, res, next) {
  if (req.session.adminLoggedIn) {
    res.redirect('/admin/adminHome');
  }
  else {
    postHelpers.viewPosts().then((posts) => {
      res.render('admin/login', { posts, error: req.session.loginError });
      req.session.loginError = null;
    })

  }


});

router.post('/adminLogin', (req, res) => {
  adminHelpers.adminLogin(req.body).then((response) => {
    if (response.status) {
      req.session.adminLoggedIn = true;
      req.session.admin = response.admin;
      res.redirect('/admin/adminHome')
    }
    else {
      req.session.loginError = "invalid username or password"
      res.redirect('/admin')
    }
  })
})

router.get('/adminHome', (req, res) => {
  let adminName = req.session.admin;
  if (req.session.admin) {
    res.render("admin/home", { admin: true, adminName })
  }
  else {
    res.redirect('/admin');
  }
})

router.get('/allPosts', (req, res) => {
  let adminName = req.session.admin;
  if (adminName) {
    postHelpers.viewAllPosts().then((posts) => {
      res.render('admin/allPosts', { admin: true, posts, adminName })
    })

  }

})

// router.get('/adminLogin',(req,res)=>{
//   res.render('admin/login',{admin:true})
// })

router.get('/viewAllUsers', (req, res) => {
  let adminName = req.session.admin;
  if (adminName) {
    adminHelpers.getAllUser().then((users) => {
      res.render('admin/allUsers', { admin: true, users, adminName })

    })
  }
})

router.get('/editUsers/:id', async (req, res) => {
  let adminName = req.session.admin;
  if (adminName) {
    let users = await adminHelpers.getUserDetails(req.params.id)
    res.render('admin/edituser', { admin: true, adminName, users })
  }
})


router.post('/editUsers/:id', (req, res) => {
  console.log(req.params.id, req.body);
  adminHelpers.editUser(req.params.id, req.body).then(() => {
    res.redirect('/admin/viewAllUsers');
  })

})

router.get('/deletePosts/:id', (req, res) => {
  let userId = req.params.id;
  adminHelpers.deletePosts(userId).then(() => {
    res.redirect('/admin/allPosts')
  })
})

router.get('/deleteUsers/:id', (req, res) => {
  let userId = req.params.id;
  adminHelpers.deleteUser(userId).then(() => {
    res.redirect('/admin/viewAllUsers');
  })

})

router.get('/adminLogout', (req, res) => {
  req.session.destroy(function (err) {
    err ? console.log("Error while logging out" + err) : res.redirect('/admin');
  });
})
module.exports = router;
