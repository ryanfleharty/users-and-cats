const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Cat = require('../models/Cat');

// INDEX ROUTE
router.get('/', (req, res)=>{
    // find all the users
    User.find({}, (err, usersFromTheDatabase)=>{
        // render the page that displays all the users
        res.render('users/index.ejs', {
            // set the template vars to the var found above
            usersOnTheTemplate: usersFromTheDatabase
        })
    })
})

// NEW ROUTE
router.get('/new', (req, res)=>{
    // render the new page with the new user form
    res.render('users/new.ejs');
})

// SHOW ROUTE
router.get('/:id', (req, res)=>{
    // find this one particular user
    User.findById(req.params.id) 
    // feed the browser the info the user has in its cat property
    .populate('cats')
    // do the below once the stuff above is done (callback)
    .exec((err, userFromTheDatabase)=>{
        if(err){
            // if there's an error, send me an error
            res.send(err);
        } else {
            // if no error, render the show page for this user
            res.render('users/show.ejs', {
                // set the template vars to the var defined above
                userOnTheTemplate: userFromTheDatabase
            });
        }

    })
})

// EDIT
router.get('/:id/edit', (req, res)=>{
    // find one particular user by their id
    User.findById(req.params.id, (err, userFromTheDatabase)=>{
        // render the edit page, pre-filled with this user's info
        res.render('users/edit.ejs', {
            // set the template vars to the var found above
            userOnTheTemplate: userFromTheDatabase
        })
    })
})

// CREATE ROUTE
router.post('/', (req, res)=>{
    // create a new user using the info in the form 
    User.create(req.body, (err, newlyCreatedUser)=>{
        console.log(newlyCreatedUser)
        // send the browser back to the index page, now featuring the new user
        res.redirect('/users')
    })
})

// UPDATE ROUTE
router.put('/:id', (req, res)=>{
    // find one particular user by id and update them with the info in the form
    User.findByIdAndUpdate(req.params.id, req.body, (err, userFromTheDatabase)=>{
        console.log(userFromTheDatabase);
        // send us back to the new and improved index page
        res.redirect('/users');
    })
})


// DELETE ROUTE
router.delete('/:id', (req, res)=>{
    // find a particular user and remove them
    User.findByIdAndDelete(req.params.id, (err, userFromTheDatabase)=>{
        console.log(userFromTheDatabase);
        // of this user's cats, delete all of them
        Cat.deleteMany({
            _id: {
                // if a cat is associated with the user found above, delete
                $in: userFromTheDatabase.cats
            }
        }, (err, data)=>{
            console.log(data);
            // take us back to the user index page, now updated
            res.redirect('/users');
        })
    })
})

module.exports = router;