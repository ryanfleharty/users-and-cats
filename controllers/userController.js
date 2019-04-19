const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Cat = require('../models/Cat');

// index route
router.get('/', (req, res)=>{
    // find all users, save users as usersFromTheDatabase variable
    User.find({}, (err, usersFromTheDatabase)=>{
        // render index page from users folder
        res.render('users/index.ejs', {
            // put usersFromTheDatabase variable on template page
            usersOnTheTemplate: usersFromTheDatabase
        })
    })
})

// new route
router.get('/new', (req, res)=>{
    // render new page from users folder
    res.render('users/new.ejs');
})

// show route
router.get('/:id', (req, res)=>{
    // find user by their id
    User.findById(req.params.id) 
    // convert cats array id's to info from cats db
    .populate('cats')
    // execute the callback, save user as userFromTheDatabase variable
    .exec((err, userFromTheDatabase)=>{
        // if there's an error, show on page
        if(err){
            res.send(err);
        } else {
            // otherwise, render the show page from users folder
            res.render('users/show.ejs', {
                // put userFromTheDatabase variable info on template page
                userOnTheTemplate: userFromTheDatabase
            });
        }

    })
})

// edit route
router.get('/:id/edit', (req, res)=>{
    // find user by their id, save user as userFromTheDatabase variable
    User.findById(req.params.id, (err, userFromTheDatabase)=>{
        // render edit page from users folder
        res.render('users/edit.ejs', {
            // put userFromTheDatabase variable info on template page
            userOnTheTemplate: userFromTheDatabase
        })
    })
})

// create route
router.post('/', (req, res)=>{
    // create a new user from body of form fields, save user as newlyCreatedUser variable
    User.create(req.body, (err, newlyCreatedUser)=>{
        // log newlyCreatedUser's info in console
        console.log(newlyCreatedUser)
        // redirect to users main page
        res.redirect('/users')
    })
})

// update route
router.put('/:id', (req, res)=>{
    // find a user by their id, update their info with what's on the form, save user 
    // as userFromTheDatabase variable
    User.findByIdAndUpdate(req.params.id, req.body, (err, userFromTheDatabase)=>{
        // log user's info in console
        console.log(userFromTheDatabase);
        // redirect to main users page
        res.redirect('/users');
    })
})

// delete route
router.delete('/:id', (req, res)=>{
    // find user by id and delete, save user as userFromTheDatabase variable
    User.findByIdAndDelete(req.params.id, (err, userFromTheDatabase)=>{
        // log user's info in console
        console.log(userFromTheDatabase);
        // find and delete cats 
        Cat.deleteMany({
            // with ids
            _id: {
                // matching those in the user's cats array
                $in: userFromTheDatabase.cats
            }
            // save data variable
        }, (err, data)=>{
            // log data in console to make sure user and their cats are deleted
            console.log(data);
            // redirect to main user's page
            res.redirect('/users');
        })
    })
})

module.exports = router;