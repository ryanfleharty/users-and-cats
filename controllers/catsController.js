const express = require('express');
const router = express.Router();
const Cat = require('../models/Cat');
const User = require('../models/User');

router.get('/', (req, res)=>{
    // Finding all cats without any parameters
    Cat.find({}, (err, catsFromTheDatabase)=>{
        // pulling up the list of cats that exist on the website
        res.render('cats/index.ejs', {
            // Saying where to pull from.
            catsOnTheTemplate: catsFromTheDatabase
        })
    })
})
    // create new cat.
router.get('/new', (req, res)=>{
    // Grabs all users that exist 
    User.find({}, (error, allUsers) => {
        if(error) {
            res.send(error)
        } else {
            // Render the page to create a new cat
            res.render('cats/new.ejs', {
                // pulling users
                usersOnTemplate: allUsers
            })
        }
    })

})

router.get('/:id', (req, res) => {
    // Finding the cat by ID to see where it belongs
    Cat.findById(req.params.id, (err, catFromTheDatabase) => {
        // find only one user
      User.findOne({
          // Find a cat with a specific Id
        "cats": req.params.id
        // looking for a response with either an error or which user has that id within their model.
      }, (err, user) => {
          // Showing the information of that cat and User
        res.render('cats/show.ejs', {
            // pulling the information from the databases.
          catOnTheTemplate: catFromTheDatabase,
          user: user
        });
      })
    })
   })

    // Grabbing the page to be able to change cat properties.

router.get('/:id/edit', (req, res)=>{
    // Finding the cat by it's specific ID within the database
    Cat.findById(req.params.id, (err, catFromTheDatabase)=>{
        // Finding the user within the database that the cat belongs to.
        User.find({}, (err, usersFromTheDatabase)=>{
            // Pulling up the edit page for the user to edit properties
            res.render('cats/edit.ejs', {
                catOnTheTemplate: catFromTheDatabase,
                usersOnTemplate: usersFromTheDatabase
            });
        })

    })
})

 // When the owner registers a new cat, Giving it a new home.
router.post('/', (req, res)=>{
    console.log(req.body);
    // Creating the cat function
    Cat.create(req.body, (err, newlyCreatedCat)=>{
        console.log(`Created a cat for user ${req.body.userId}`);
        // Finding the specific user ID for that cat to be bound to
        User.findById(req.body.userId, function(err, userFound)
        {
            // Pushing the cat ID into the owners model
            userFound.cats.push(newlyCreatedCat._id);
            // Saving to the database that the cat is in there.
            userFound.save((err, savedUser)=>{
                console.log(savedUser);
                // Sending the user back to the cat list page.
                res.redirect('/cats')
            });
        });

    })
})

router.put('/:id', (req, res)=>{
    console.log(req.body);
    // Executing changing properties of the cat and how it would be either older or a different owner.
    // removing it from the old owners object array and adding it to the new one. 
    Cat.findByIdAndUpdate(req.params.id, req.body, {new: true},(err, updatedCat)=>{
        // Finding a specific User by it's ID
      User.findOne({'cats': req.params.id}, (err, foundUser) => {
          // Turning the Owners ID into a string and checking if it does not equal it's value
        if(foundUser._id.toString() !== req.body.userId){
            // removing the old data of the cat from the User's model
          foundUser.cats.remove(req.params.id);
          // Saving the new version to the database
          foundUser.save((err, savedFoundUser) => {
              // Finding the User again
            User.findById(req.body.userId, (err, newUser) => {
                // Updating the cat ID 
              newUser.cats.push(updatedCat._id);
              // Saving to the database
              newUser.save((err, savedNewUser) => {
                  // Redirect back to the Cats page
                res.redirect('/cats/' + req.params.id);
              })
            })
          })
        } else {
            // If the first one doesn't apply direct straight back to the cats page
          res.redirect('/cats/' + req.params.id)
        }
      })
    });
  });


router.delete('/:id', (req, res)=>{
    //  Removing all traces of the cat from the database.
    // RIP ;__;
    Cat.findByIdAndDelete(req.params.id, (err, catFromTheDatabase)=>{
        console.log(catFromTheDatabase);
        // find the cat by it's Id
        User.findOne({'cats': req.params.id}, (err, foundUser)=>{
            if(err){
                console.log(err)
            }else{
                console.log(foundUser);
                // Removing it from the Owners Model
                foundUser.cats.remove(req.params.id);
                // Saving to the database
                foundUser.save((err, updatedUser)=>{
                    console.log(updatedUser);
                    // Redirecting to the cats page
                    res.redirect('/cats');  
                })
            };
        });
    });
});

module.exports = router;