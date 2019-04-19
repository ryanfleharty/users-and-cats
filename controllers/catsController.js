const express = require('express');
const router = express.Router();
const Cat = require('../models/Cat');
const User = require('../models/User');

// index route
router.get('/', (req, res)=>{
    // find all cats, store in variable catsFromTheDatabase
    Cat.find({}, (err, catsFromTheDatabase)=>{
        // render the index page from cats folder
        res.render('cats/index.ejs', {
            // put catsFromTheDatabase variable on template
            catsOnTheTemplate: catsFromTheDatabase
        })
    })
})


// new route
router.get('/new', (req, res)=>{
    // find all users, save in allUser variable
    User.find({}, (error, allUsers) => {
        // if there's an error, show it on screen
        if(error) {
            res.send(error)
        } else {
            // otherwise, render new page from cats folder
            res.render('cats/new.ejs', {
                // put users variable on template
                usersOnTemplate: allUsers
            })
        }
    })

})


// show route
router.get('/:id', (req, res) => {
    // find a cat's id, save as catFromTheDatabase variable
    Cat.findById(req.params.id, (err, catFromTheDatabase) => {
        // find a user
      User.findOne({
          // who has a cats array containing the catFromTheDatabase's id
        "cats": req.params.id
        // save that user as variable user
      }, (err, user) => {
          // render the show page from the cats folder
        res.render('cats/show.ejs', {
            // put cats variable on template page
          catOnTheTemplate: catFromTheDatabase,
          // user variable on template page
          user: user
        });
      })
    })
   })

// edit route
router.get('/:id/edit', (req, res)=>{
    // find a cat's id, save cat as catFromTheDatabase variable
    Cat.findById(req.params.id, (err, catFromTheDatabase)=>{
        // find all users, save as usersFromTheDatabase variable
        User.find({}, (err, usersFromTheDatabase)=>{
            // render edit page from cats folder
            res.render('cats/edit.ejs', {
                // put cats variable on template page
                catOnTheTemplate: catFromTheDatabase,
                // put users variable on template page
                usersOnTemplate: usersFromTheDatabase
            });
        })

    })
})

// create route
router.post('/', (req, res)=>{
    // checking what info came in from the form on teh edit page
    console.log(req.body);
    // create a new cat from info on form, save in newlyCreatedCat variable
    Cat.create(req.body, (err, newlyCreatedCat)=>{
        // check that created cat went to correct user id
        console.log(`Created a cat for user ${req.body.userId}`);
        // find user by id, save in userFound variable
        User.findById(req.body.userId, function(err, userFound)
        {
            // push newlyCreatedCat into userFound's cat array
            userFound.cats.push(newlyCreatedCat._id);
            // save userFound in db, save a savedUser variable
            userFound.save((err, savedUser)=>{
                // check that savedUser variable actually has new cat
                console.log(savedUser);
                // redirect to cats page
                res.redirect('/cats')
            });
        });

    })
})

// update route
router.put('/:id', (req, res)=>{
    // check what info came in from form on edit page
    console.log(req.body);
    // find a cat by it's id, update it's info with body from form, show new info in console,
    // save as updatedCat variable
    Cat.findByIdAndUpdate(req.params.id, req.body, {new: true},(err, updatedCat)=>{
        // find user who has that cat's id in their cats array, save user as foundUser variable
      User.findOne({'cats': req.params.id}, (err, foundUser) => {
          // if foundUser's id is different from the user's id from the submitted form
        if(foundUser._id.toString() !== req.body.userId){
            // remove the cat from foundUser's cats array
          foundUser.cats.remove(req.params.id);
          // save foundUser in db, save as savedFoundUser variable
          foundUser.save((err, savedFoundUser) => {
              // find cat's new owner/user by matching form body id with user's id, save user as 
              // newUser variable 
            User.findById(req.body.userId, (err, newUser) => {
                // push updatedCat's id into newUser's cats array
              newUser.cats.push(updatedCat._id);
              // save new user in db, save as savedNewUser variable
              newUser.save((err, savedNewUser) => {
                  // redirect to cat's show page
                res.redirect('/cats/' + req.params.id);
              })
            })
          })
        } else {
            // if cat's user doesn't change on edit page form, just redirect to cat's show page
          res.redirect('/cats/' + req.params.id)
        }
      })
    });
  });

// delete route
router.delete('/:id', (req, res)=>{
    // find a cat by their id and delete, save cat as catFromTheDatabase variable
    Cat.findByIdAndDelete(req.params.id, (err, catFromTheDatabase)=>{
        // check that the cat's info is saved/correct
        console.log(catFromTheDatabase);
        // find user with that cat's id in their cats array, save user as foundUser variable
        User.findOne({'cats': req.params.id}, (err, foundUser)=>{
            // if there's an error, log in console
            if(err){
                console.log(err)
            }else{
                // otherwise, show foundUser's info in console
                console.log(foundUser);
                // remove cat's id from foundUser's cats array
                foundUser.cats.remove(req.params.id);
                // save foundUser in db, save user as updatedUser variable
                foundUser.save((err, updatedUser)=>{
                    // log updatedUser's info in console
                    console.log(updatedUser);
                    // redirect to cat's main page
                    res.redirect('/cats');  
                })
            };
        });
    });
});

module.exports = router;