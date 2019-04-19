//require express and set router method in a variable, require cat and user models
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Cat = require('../models/Cat');

//client requests to see users
router.get('/', (req, res)=>{
//find users
    User.find({}, (err, usersFromTheDatabase)=>{
//render users to ejs page
        res.render('users/index.ejs', {
//inject variable for user to use on ejs page
            usersOnTheTemplate: usersFromTheDatabase
        })
    })
})
//new route 
//recieve request from client to show new/create page
router.get('/new', (req, res)=>{
//render the new user template 
    res.render('users/new.ejs');
})
//show user page
//client requests to see specific user 
router.get('/:id', (req, res)=>{
//find the requested user in the db
    User.findById(req.params.id)
//check the db to see populate cats based on the id of the cat reference in the user object 
    .populate('cats')
//executes the request.  waits on the user information
    .exec((err, userFromTheDatabase)=>{
        if(err){
//check for error
            res.send(err);
//render the show template
        } else {
            res.render('users/show.ejs', {
//inject the variables to the template
                userOnTheTemplate: userFromTheDatabase
            });
        }

    })
})

//find the user requested from the client in the db based on edit request input 
router.get('/:id/edit', (req, res)=>{
    User.findById(req.params.id, (err, userFromTheDatabase)=>{
//serve the edit template 
        res.render('users/edit.ejs', {
//inject the variables
            userOnTheTemplate: userFromTheDatabase
        })
    })
})
//create/post route
//post the information received from the new template form
router.post('/', (req, res)=>{
//create new user in the db 
    User.create(req.body, (err, newlyCreatedUser)=>{
        console.log(newlyCreatedUser)
//redirect to user page
        res.redirect('/users')
    })
})
//update/put
//find the requested user from the edit form
router.put('/:id', (req, res)=>{
//update information based on form from edit template
    User.findByIdAndUpdate(req.params.id, req.body, (err, userFromTheDatabase)=>{
        console.log(userFromTheDatabase);
//redirect client to user page
        res.redirect('/users');
    })
})
//delete route
router.delete('/:id', (req, res)=>{
//identify the user in the db
    User.findByIdAndDelete(req.params.id, (err, userFromTheDatabase)=>{
        console.log(userFromTheDatabase);
//delete user's cats in the db
        Cat.deleteMany({
//find the cats unique id
            _id: {
//use mongo command to delete user reference from cat object array
                $in: userFromTheDatabase.cats
            }
//now that the user reference is deleted, delete the cat, unless there is an error
        }, (err, data)=>{
            console.log(data);
//redirect to user page
            res.redirect('/users');
        })
    })
})
//export router
module.exports = router;