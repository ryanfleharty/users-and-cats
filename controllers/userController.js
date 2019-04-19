const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Cat = require('../models/Cat');

router.get('/', (req, res)=>{
    // find all the users
    User.find({}, (err, usersFromTheDatabase)=>{
        // render to the users index page 
        res.render('users/index.ejs', {
            // send usersFromTheDatabase to usersOnthetemplate
            usersOnTheTemplate: usersFromTheDatabase
        })
    })
})

router.get('/new', (req, res)=>{
    // get the new page info, render the users new page
    res.render('users/new.ejs');
})


router.get('/:id', (req, res)=>{
    // find users id
    User.findById(req.params.id) 
    // populate that user with the new cats 
    .populate('cats')
    // execute this after user has been populated
    .exec((err, userFromTheDatabase)=>{
        if(err){
            res.send(err);
        } else {
            // render the users show page
            res.render('users/show.ejs', {
                // send userFromTheDatabase to userOnTheTemplate
                userOnTheTemplate: userFromTheDatabase
            });
        }

    })
})

router.get('/:id/edit', (req, res)=>{
    // Find a specific user by id 
    User.findById(req.params.id, (err, userFromTheDatabase)=>{ 
        // bring it to the edit form 
        // render user edit page

        res.render('users/edit.ejs', {
            // send userFromTheDatabase to userFromTheDatabase
            userOnTheTemplate: userFromTheDatabase
        })
    })
})

router.post('/', (req, res)=>{
    // take user to create form(req.body)
    User.create(req.body, (err, newlyCreatedUser)=>{
        //fill out//
        console.log(newlyCreatedUser)
        // redirect back to users after creation
        res.redirect('/users')
    })
})

router.put('/:id', (req, res)=>{
    // find the user that was edited by its id
    User.findByIdAndUpdate(req.params.id, req.body, (err, userFromTheDatabase)=>{
        // push it up and update it 
        console.log(userFromTheDatabase);
        // redirect back to the users index page 
        res.redirect('/users');
    })
})

router.delete('/:id', (req, res)=>{
    // find the specific users id that has been selected
    User.findByIdAndDelete(req.params.id, (err, userFromTheDatabase)=>{
        console.log(userFromTheDatabase);
        // get that users cats id 
        Cat.deleteMany({
            _id: {  // take the users cats id from the database and remove 
                $in: userFromTheDatabase.cats
            }
        }, (err, data)=>{
            console.log(data);
            // redirect back to the users index
            res.redirect('/users');
        })
    })
})

module.exports = router;