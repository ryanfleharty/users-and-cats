const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Cat = require('../models/Cat');

router.get('/', (req, res)=>{
    //find all the users in the database!!!!
    User.find({}, (err, usersFromTheDatabase)=>{
        //render an index of all the users in the database
        res.render('users/index.ejs', {
        //take all the users in the database and put them 
        //on the page using a for loop in the index.ejs file
        //using the the redefined variable below
            usersOnTheTemplate: usersFromTheDatabase
        })
    })
})

router.get('/new', (req, res)=>{
    //make a page that allows you to make a new user
    res.render('users/new.ejs');
})

router.get('/:id', (req, res)=>{
    //find all the users by their id number
    User.findById(req.params.id) 
    //put the cats that they own in their array
    .populate('cats')
    //execute the function
    .exec((err, userFromTheDatabase)=>{
        if(err){
            res.send(err);
        } else {
            //render a show page for the user with all of their
            //cats in it
            res.render('users/show.ejs', {
            //make the user who's page you are accessing, accessible
            //with all the information stored in the database
                userOnTheTemplate: userFromTheDatabase
            });
        }

    })
})

router.get('/:id/edit', (req, res)=>{
    //find user by it's id number
    User.findById(req.params.id, (err, userFromTheDatabase)=>{
        //render an edit page to edit that user's information
        res.render('users/edit.ejs', {
            //access editable information by clicking on the 
            //edit button found in the for loop on the index.page
            //or based on the new id 
            userOnTheTemplate: userFromTheDatabase
        })
    })
})

router.post('/', (req, res)=>{
    //create a new user!!!!!
    User.create(req.body, (err, newlyCreatedUser)=>{
        console.log(newlyCreatedUser)
        //redirect back to the user's index.
        res.redirect('/users')
    })
})

router.put('/:id', (req, res)=>{
    //find the user by it's id name and update it accordingly
    User.findByIdAndUpdate(req.params.id, req.body, (err, userFromTheDatabase)=>{
        console.log(userFromTheDatabase);
        //redirect back to the user index page
        res.redirect('/users');
    })
})

router.delete('/:id', (req, res)=>{
    //find user by it's id and delete it 
    User.findByIdAndDelete(req.params.id, (err, userFromTheDatabase)=>{
        console.log(userFromTheDatabase);
        //delete all of the cats that live in its cats array on the server
        Cat.deleteMany({
            //by the cats id
            _id: {
                //within the cats array 
                $in: userFromTheDatabase.cats
            }
        }, (err, data)=>{
            console.log(data);
            //redirect back to the user's index page
            res.redirect('/users');
        })
    })
})

module.exports = router;