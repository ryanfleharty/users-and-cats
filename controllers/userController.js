//REQUIRE THE STUFF!
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Cat = require('../models/Cat');


// INDEX ROUTE
router.get('/', (req, res)=>{
    // FIND ALL THE USERS FROM TEH DB 
    User.find({}, (err, usersFromTheDatabase)=>{
        // RENDER THE INDEX EJS PAGE
        res.render('users/index.ejs', {
            //INJECT THE VARIABLE THAT EQUALS THE RETURNED DB DATA
            usersOnTheTemplate: usersFromTheDatabase
        })
    })
})

// NEW ROUTE - GET IT
router.get('/new', (req, res)=>{
    // RENDER THE NEW EJS PAGE
    res.render('users/new.ejs');
})

// SHOW PAGE - BY ID
router.get('/:id', (req, res)=>{
    // FIND THE USER WHO MATCHES THE SPECIFIC ID
    User.findById(req.params.id) 
    // CHANGE THE RETURNED DATA FROM JUST THE ID TO INCLUDE THE CATS STUFF
    .populate('cats')
    // EXECUTE THE LOGIC AFTER THE DB CALL
    .exec((err, userFromTheDatabase)=>{
        //CHECK FOR ERROR
        if(err){
            //SEND THE ERROR IF THERE IS ONE 
            res.send(err);
            // OR ELSE >:0
        } else {
            // BRING UP THE SHOW PAGE FOR THE USERS
            res.render('users/show.ejs', {
                // INJECT THE VARIABLE
                userOnTheTemplate: userFromTheDatabase
            });
        }

    })
})

// EDIT ROUTE
router.get('/:id/edit', (req, res)=>{
    // FIND THE USER BY THE ID AND RETURN THAT USER
    User.findById(req.params.id, (err, userFromTheDatabase)=>{
        // RENDER THE USERS EDIT EJS PAGE
        res.render('users/edit.ejs', {
            //INJECT THE VARIABLE TO THE PAGE
            userOnTheTemplate: userFromTheDatabase
        })
    })
})


// CREATE ROUTE
router.post('/', (req, res)=>{
    // CREATE A NEW USER WITH THE DATA FROM THE EJS PAGE FORM
    User.create(req.body, (err, newlyCreatedUser)=>{
        // LOG THE NEW USER IN THE CONSOLE
        console.log(newlyCreatedUser)
        // BRING UP THE USERS HOME PAGE
        res.redirect('/users')
    })
})

// UPDATE ROUTE
router.put('/:id', (req, res)=>{
    // FIND THE USER WHO MATCHES THE REQ.PARAMS.ID, UPDATE IT WITH THE REQ.BODY DATA, RETURN THE UPDATED USER
    User.findByIdAndUpdate(req.params.id, req.body, (err, userFromTheDatabase)=>{
        //LOG THE UPDATED USER
        console.log(userFromTheDatabase);
        //REDIRECT TO THE USERS HOME PAGE
        res.redirect('/users');
    })
})

//DELETE ROUTE
router.delete('/:id', (req, res)=>{
    // FIND THE USER BY ID AND DELETE THEM, RETURN THE MATCHING USER
    User.findByIdAndDelete(req.params.id, (err, userFromTheDatabase)=>{
        // LOG THE MATCHED USER RETURNED FROM THE DB
        console.log(userFromTheDatabase);
        // DELETE THE CATS WHO HAVE A USER WHOS CATS ARRAY INCLUDES THEIR MATCHED CAT ID
        Cat.deleteMany({
            _id: {
                $in: userFromTheDatabase.cats
            }
            //CALLBACK FUNCTION WITH THE DELETED CATS RETURNED
        }, (err, data)=>{
            // LOG THE DATA OF THE DELETED CATS
            console.log(data);
            // BRING UP THE USERS HOME PAGE
            res.redirect('/users');
        })
    })
})

//EXPORT THAT SHIT!
module.exports = router;