const express = require('express');
const router = express.Router();
const Cat = require('../models/Cat');
const User = require('../models/User');

router.get('/', (req, res)=>{
    // find all of the cats, stored in a variable called catsFromTheDatabase
    Cat.find({}, (err, catsFromTheDatabase)=>{
        // render the index page 
        res.render('cats/index.ejs', {
        // names a variable to be displayed on the index.ejs
            catsOnTheTemplate: catsFromTheDatabase
        })
    })
})

router.get('/new', (req, res)=>{
    // finds all users to be displayed
    User.find({}, (error, allUsers) => {
    // if else check for errors
        if(error) {
            res.send(error)
        } else {
    // render cats/new.ejs with users displayed on the page
            res.render('cats/new.ejs', {
    // names a variable to be used on new.ejs
                usersOnTemplate: allUsers
            })
        }
    })

})

router.get('/:id', (req, res) => {
    // finds a specific cat from the database, by ID
    Cat.findById(req.params.id, (err, catFromTheDatabase) => {
        // finds a specific user based on "cats": req.params.id, or generated :_id
      User.findOne({
        // assigns current targeted cat to variable "cats"
        "cats": req.params.id
      }, (err, user) => {
        // renders the specific cat onto cats/show.ejs
        res.render('cats/show.ejs', {
        // names a variable to be put on the show.ejs page
          catOnTheTemplate: catFromTheDatabase,
          user: user
        });
      })
    })
   })

router.get('/:id/edit', (req, res)=>{
    // finds a specific cat from the database, by ID    
    Cat.findById(req.params.id, (err, catFromTheDatabase)=>{
    // finds all users in the DB
        User.find({}, (err, usersFromTheDatabase)=>{
    // renders the page with specific cat, and all users on dropdown list for editing
            res.render('cats/edit.ejs', {
    // names variable for the specific cat from the database to be put on edit.ejs
                catOnTheTemplate: catFromTheDatabase,
    // names the users to be displayed on the dropdown list   
                usersOnTemplate: usersFromTheDatabase
            });
        })

    })
})


router.post('/', (req, res)=>{
    console.log(req.body);
   // takes input values to create a new Cat 
    Cat.create(req.body, (err, newlyCreatedCat)=>{
        console.log(`Created a cat for user ${req.body.userId}`);
    // Searches users by ID to determine which user owns the new cat
        User.findById(req.body.userId, function(err, userFound)
        {
    // adds the user by ID, as the owner, to the new cat object
            userFound.cats.push(newlyCreatedCat._id);
    // saves the user to the new cat object
            userFound.save((err, savedUser)=>{
                console.log(savedUser);
    // reloads /cats with the new cat added to the array
                res.redirect('/cats')
            });
        });

    })
})

router.put('/:id', (req, res)=>{
    console.log(req.body);
    // finds a specific cat by ID and prepares to update its values
    Cat.findByIdAndUpdate(req.params.id, req.body, {new: true},(err, updatedCat)=>{
    // finds the User that owns the specific cat we already found above
      User.findOne({'cats': req.params.id}, (err, foundUser) => {
    // if user info is being changed....
        if(foundUser._id.toString() !== req.body.userId){
        // delete old user info
          foundUser.cats.remove(req.params.id);
        // and save new user info
          foundUser.save((err, savedFoundUser) => {
        // finds the new user by ID
            User.findById(req.body.userId, (err, newUser) => {
        // and adds the updated cat to the user
              newUser.cats.push(updatedCat._id);
        // saves new cat to User
              newUser.save((err, savedNewUser) => {
        // reloads /cats page with new info saved in proper places
                res.redirect('/cats/' + req.params.id);
              })
            })
          })
        } else {
        // if Owner doesn't change, reloads the page
          res.redirect('/cats/' + req.params.id)
        }
      })
    });
  });


router.delete('/:id', (req, res)=>{
    // finds specific cat by ID and prepares to delete them from the DB
    Cat.findByIdAndDelete(req.params.id, (err, catFromTheDatabase)=>{
        console.log(catFromTheDatabase);
    // finds the User that owns the specific cat found above
        User.findOne({'cats': req.params.id}, (err, foundUser)=>{
            if(err){
                console.log(err)
            }else{
                console.log(foundUser);
    // removes the cat from the User 
                foundUser.cats.remove(req.params.id);
    // Saves user info after the cat has been removed
                foundUser.save((err, updatedUser)=>{
                    console.log(updatedUser);
    // Reloads the page with the deleted cat gone from said page
                    res.redirect('/cats');  
                })
            };
        });
    });
});


// something easyto forget to put in and make your whole file not work
module.exports = router;