const express = require('express');
const router = express.Router();
const Cat = require('../models/Cat');
const User = require('../models/User');

// INDEX route
router.get('/', (req, res)=>{
    // finds all the cats in the database via mongoose
    Cat.find({}, (err, catsFromTheDatabase)=>{
        // renders the INDEX route's template defined in views
        res.render('cats/index.ejs', {
            // associated the DB variable from the mongoose method to a variable to pass to the template
            catsOnTheTemplate: catsFromTheDatabase
        })
    })
})

// NEW Route
router.get('/new', (req, res)=>{
    // finds alll the users in the database via mongoose
    User.find({}, (error, allUsers) => {
        if(error) {
            // if db err than display err to client
            res.send(error)
        } else {
            // renders the NEW route's template defined in views
            res.render('cats/new.ejs', {
                // associates allUsers from DB to the usersOnTemplate so they can populate drop-down during cat creation
                usersOnTemplate: allUsers
            })
        }
    })
})

// SHOW Route
router.get('/:id', (req, res) => {
    // finds one cat by its id from the URL using mongoose DB method
    Cat.findById(req.params.id, (err, catFromTheDatabase) => {
      // finds the one user that owns this cat using mongoose DB method
      User.findOne({
          //selects the cat from the database that matches req.params.id
        "cats": req.params.id
      }, (err, user) => { // function callback and err catching
        // renders the SHOW route's template
        res.render('cats/show.ejs', {
            // associates the catOnTheTemplate variable with the catFromTheDatabase and passes to template
          catOnTheTemplate: catFromTheDatabase, //
          // also passes the "user" from the db as a "user" on the template
          user: user
        });
      })
    })
   })

router.get('/:id/edit', (req, res)=>{
    Cat.findById(req.params.id, (err, catFromTheDatabase)=>{
        User.find({}, (err, usersFromTheDatabase)=>{
            res.render('cats/edit.ejs', {
                catOnTheTemplate: catFromTheDatabase,
                usersOnTemplate: usersFromTheDatabase
            });
        })

    })
})

// CREATE route
router.post('/', (req, res)=>{
    // confirms we have a form body from the NEW route's template
    console.log(req.body);
    // creates a new cat in the database matching up details from req.body "name="
    Cat.create(req.body, (err, newlyCreatedCat)=>{
        // logs we have a cat for a particular user
        console.log(`Created a cat for user ${req.body.userId}`);
        // finds the user in the DB via mongoose method utilizing the req.body.userId field data
        User.findById(req.body.userId, function(err, userFound)
        {
            // pushes the new cat into the particular user's array of cat objects in the db.
            userFound.cats.push(newlyCreatedCat._id);
            // saves the user item after the update to it's cats array
            userFound.save((err, savedUser)=>{
                // prints the savedUser object to console
                console.log(savedUser);
                // redirects to the cats index page to show the new cat
                res.redirect('/cats')
            });
        });

    })
})

// UPDATE route
router.put('/:id', (req, res)=>{
    // confirms we have req.body for updating with
    console.log(req.body);
    // finds the particular cat that matches the req.params.id and updates it with req.body retuning updated data
    Cat.findByIdAndUpdate(req.params.id, req.body, {new: true},(err, updatedCat)=>{
        // finds the one user item that has the cat that was updated using mongoose method
      User.findOne({'cats': req.params.id}, (err, foundUser) => {
          // if that user is NOT the same as the user in the edit form's userId field then...
        if(foundUser._id.toString() !== req.body.userId){
            // remove the cat from the old user's array in the DB
          foundUser.cats.remove(req.params.id);
            // save the user so the cat's ID is no longer in the cats[].
          foundUser.save((err, savedFoundUser) => {
              // find the new user requested in the userID field of the edit form using mongoose
            User.findById(req.body.userId, (err, newUser) => {
                // push the updated cat into the new user items cats array field.
              newUser.cats.push(updatedCat._id);
                // save the new user item object
              newUser.save((err, savedNewUser) => {
                  // redirect back to the specific cat edit page and show updates
                res.redirect('/cats/' + req.params.id);
              })
            })
          })
        } else {
            // if the user is identical to before and only other cat object properties were changed, redirect as well.
          res.redirect('/cats/' + req.params.id)
        }
      })
    });
  });

// DELETE route
router.delete('/:id', (req, res)=>{
    // finds the cat in mongoDB and deletes it by the req.params.id from the URL
    Cat.findByIdAndDelete(req.params.id, (err, catFromTheDatabase)=>{
        // logs the deleted Cat to console
        console.log(catFromTheDatabase);
        // finds the user that used to have the deleted cat
        User.findOne({'cats': req.params.id}, (err, foundUser)=>{
            if(err){
                console.log(err)
            }else{
                // logs the foundUser to the console
                console.log(foundUser);
                // remove the ._id from the User object's cat array
                foundUser.cats.remove(req.params.id);
                // save the updatedUser with that cat's id removed.
                foundUser.save((err, updatedUser)=>{
                    // print the updated user to the console to see the change
                    console.log(updatedUser);
                    // redirect back to the cats index
                    res.redirect('/cats');  
                })
            };
        });
    });
});

module.exports = router;