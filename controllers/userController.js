const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Cat = require('../models/Cat');


// get route for the users homepage
router.get('/', (req, res)=>{
  // finds all the users from db
    User.find({}, (err, usersFromTheDatabase)=>{
      // renders the users homepage
        res.render('users/index.ejs', {
          // defines usersOnTemplate and the found users
            usersOnTheTemplate: usersFromTheDatabase
        })
    })
})


// route for new user page
router.get('/new', (req, res)=>{
  // renders the new user's page
    res.render('users/new.ejs');
})


// gets the show page for the user
router.get('/:id', (req, res)=>{
  // find the correct user using the id
    User.findById(req.params.id)
    // populates user's cats array with cats
    .populate('cats')
    // executes the callback function
    .exec((err, userFromTheDatabase)=>{
      // err check
        if(err){
            res.send(err);
        } else {
          // renders the user's show page
            res.render('users/show.ejs', {
              // defines userOnTheTemplate ans the found user
                userOnTheTemplate: userFromTheDatabase
            });
        }

    })
})


// get route for user's edit page
router.get('/:id/edit', (req, res)=>{
  // finds user by their id
    User.findById(req.params.id, (err, userFromTheDatabase)=>{
      // renders the edit page
        res.render('users/edit.ejs', {
          // defines the userOnTheTemplate ans the found user
            userOnTheTemplate: userFromTheDatabase
        })
    })
})

// post route for new user
router.post('/', (req, res)=>{
  // creates a new user in the database defined by the submitted form
    User.create(req.body, (err, newlyCreatedUser)=>{
      // redirects to the users homepage
        res.redirect('/users')
    })
})

// the put route for a user
router.put('/:id', (req, res)=>{
  // updates the user in the database with the submitted form
    User.findByIdAndUpdate(req.params.id, req.body, (err,  userFromTheDatabase)=>{
      // redirects to the users homepage
        res.redirect('/users');
    })
})

// the delete route for a user
router.delete('/:id', (req, res)=>{
  // finds the user and deletes them from the db
    User.findByIdAndDelete(req.params.id, (err, userFromTheDatabase)=>{
      // finds the cats in the deleted users cats array and eletes them
        Cat.deleteMany({
            _id: {
              // "if their id is $in the cats array"
                $in: userFromTheDatabase.cats
            }
        }, (err, data)=>{
          // redirects to users homepage
            res.redirect('/users');
        })
    })
})

// exports router to the server.js to be used as the app
module.exports = router;
