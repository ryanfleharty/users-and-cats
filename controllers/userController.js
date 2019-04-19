const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Cat = require('../models/Cat');

// INDEX route
router.get('/', (req, res)=>{
    // finds all users in db and populates the page via the index template
    User.find({}, (err, usersFromTheDatabase)=>{
        res.render('users/index.ejs', {
            usersOnTheTemplate: usersFromTheDatabase
        })
    })
})

// NEW route
router.get('/new', (req, res)=>{
    // renders the new user template to the page for client to fill in
    res.render('users/new.ejs');
})

// SHOW route
router.get('/:id', (req, res)=>{
    // finds the user in the db that correlates to the req.params.id from teh URL
    User.findById(req.params.id)
    // populates that users cat array (swapping in the _id with the entire cat object)
    .populate('cats')
    // executes the chained request above and defines err and callback
    .exec((err, userFromTheDatabase)=>{
        if(err){
            res.send(err);
        } else {
            // renders the show template to the page passing the userFromTheDatabase as userOnTheTemplate
            res.render('users/show.ejs', {
                userOnTheTemplate: userFromTheDatabase
            });
        }
    })
})

// EDIT route
router.get('/:id/edit', (req, res)=>{
    // find the user by id from mongoose and render the edit template passing back that user into userOnTheTemplate
    User.findById(req.params.id, (err, userFromTheDatabase)=>{
        res.render('users/edit.ejs', {
            userOnTheTemplate: userFromTheDatabase
        })
    })
})

// CREATE route
router.post('/', (req, res)=>{
    // create a new user in the db, using the body from the NEW template and redirect to the /users index page
    User.create(req.body, (err, newlyCreatedUser)=>{
        console.log(newlyCreatedUser)
        res.redirect('/users')
    })
})

// UPDATE route
router.put('/:id', (req, res)=>{
    // find the specific user in the db and update it with the req.body fields
    User.findByIdAndUpdate(req.params.id, req.body, (err, userFromTheDatabase)=>{
        console.log(userFromTheDatabase);
        res.redirect('/users');
    })
})

// DELETE route
router.delete('/:id', (req, res)=>{
    // find the user by ID and delete it
    User.findByIdAndDelete(req.params.id, (err, userFromTheDatabase)=>{
        console.log(userFromTheDatabase);
        // Also delete all of that user's cats in their cats[]
        Cat.deleteMany({
            // use some MongoDB to get all cats $in
            _id: {
                $in: userFromTheDatabase.cats
            }
        }, (err, data)=>{
            console.log(data);
            // redirect to /users index page
            res.redirect('/users');
        })
    })
})

module.exports = router;