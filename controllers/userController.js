const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Cat = require('../models/Cat');

router.get('/', (req, res)=>{
    // Showing all of the Owners that have or had cats.
    User.find({}, (err, usersFromTheDatabase)=>{
        // Showing index page for the users
        res.render('users/index.ejs', {
            // Grabbing the user data from the database.
            usersOnTheTemplate: usersFromTheDatabase
        })
    })
})
// showing the new user page
router.get('/new', (req, res)=>{
    // Showing someone looking to register as a new user on the site.
    res.render('users/new.ejs');
})
// Showing the Users data
router.get('/:id', (req, res)=>{
    // Displaying What cats the owner has
    User.findById(req.params.id) 
    // Actually listing out the cats names rather than just an ID
    .populate('cats')
    // Using the function to grab the data
    .exec((err, userFromTheDatabase)=>{
        if(err){
            res.send(err);
        } else {
            // Taking the user to the show page for the data
            res.render('users/show.ejs', {
                // Grabbing User data
                userOnTheTemplate: userFromTheDatabase
            });
        }

    })
})

router.get('/:id/edit', (req, res)=>{
    //  Calling the page to Edit the owners information 
    User.findById(req.params.id, (err, userFromTheDatabase)=>{
        // Showing the edit page for Users
        res.render('users/edit.ejs', {
            userOnTheTemplate: userFromTheDatabase
        })
    })
})

router.post('/', (req, res)=>{
    // The Act of creating a User for an owner 
    User.create(req.body, (err, newlyCreatedUser)=>{
        console.log(newlyCreatedUser)
        // Redirecting back to the user list.
        res.redirect('/users')
    })
})
    // Updating the user's info
router.put('/:id', (req, res)=>{
    // Find the User by it's ID and update if a cat was removed from its data.
    User.findByIdAndUpdate(req.params.id, req.body, (err, userFromTheDatabase)=>{
        console.log(userFromTheDatabase);
        // Redirect back to the user list
        res.redirect('/users');
    })
})

// Delete Users
router.delete('/:id', (req, res)=>{
    // Find the User by their ID and delete
    User.findByIdAndDelete(req.params.id, (err, userFromTheDatabase)=>{
        console.log(userFromTheDatabase);
        // Delete any cat that is within the User's Model
        Cat.deleteMany({
            // Use these to make specific calls Within the Mongo Database
            _id: {

                $in: userFromTheDatabase.cats
            }
        }, (err, data)=>{
            console.log(data);

            res.redirect('/users');
        })
    })
})

module.exports = router;