const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Cat = require('../models/Cat');

router.get('/', (req, res)=>{
    User.find({}, (err, usersFromTheDatabase)=>{
        res.render('users/index.ejs', {
            usersOnTheTemplate: usersFromTheDatabase
        })
    })
})

router.get('/new', (req, res)=>{
    //render the page where we can create new users.
    res.render('users/new.ejs');
})

router.get('/:id', (req, res)=>{
    //find the id of the user we wish to display,
    User.findById(req.params.id) 
    //show all the cats associated with this user,
    .populate('cats')
    //execute the function?
    .exec((err, userFromTheDatabase)=>{
        if(err){
            res.send(err);
        } else {
            //render the page showing that specific user.
            res.render('users/show.ejs', {
                //send user info from the database.
                userOnTheTemplate: userFromTheDatabase
            });
        }

    })
})

router.get('/:id/edit', (req, res)=>{
    //find the id of the user we wish to edit,
    User.findById(req.params.id, (err, userFromTheDatabase)=>{
        //render the edit page for that specific user,
        res.render('users/edit.ejs', {
            //send user info from the database.
            userOnTheTemplate: userFromTheDatabase
        })
    })
})

router.post('/', (req, res)=>{
    //create a new user using the form data,
    User.create(req.body, (err, newlyCreatedUser)=>{
        console.log(newlyCreatedUser)
        //redirect back to the users page with the newly added user.
        res.redirect('/users')
    })
})

router.put('/:id', (req, res)=>{
    //find the id of the user we wish to update,
    User.findByIdAndUpdate(req.params.id, req.body, (err, userFromTheDatabase)=>{
        console.log(userFromTheDatabase);
        //redirect back to user page.
        res.redirect('/users');
    })
})

router.delete('/:id', (req, res)=>{
    //find id of user who we wish to delete.
    User.findByIdAndDelete(req.params.id, (err, userFromTheDatabase)=>{
        console.log(userFromTheDatabase);
        //delete them,
        Cat.deleteMany({
            _id: {
                $in: userFromTheDatabase.cats
            }
        }, (err, data)=>{
            console.log(data);
            //redirect back to updated /users page.
            res.redirect('/users');
        })
    })
})

module.exports = router;