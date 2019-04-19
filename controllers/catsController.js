const express = require('express');
const router = express.Router();
const Cat = require('../models/Cat');
const User = require('../models/User');


// defines which get route this is
router.get('/', (req, res)=>{
  // finds all cats from cats db
    Cat.find({}, (err, catsFromTheDatabase)=>{
      // renderd the cats index page
        res.render('cats/index.ejs', {
          // defines the catsOnTheTemplate as the found cats
            catsOnTheTemplate: catsFromTheDatabase
        })
    })
})



// get route for create new cat page
router.get('/new', (req, res)=>{
  // finda all the users from the users db
    User.find({}, (error, allUsers) => {
      // if error, show it
        if(error) {
            res.send(error)
        } else {
          // render the new cats page
            res.render('cats/new.ejs', {
              // defines usersOnTemplate as the found users
                usersOnTemplate: allUsers
            })
        }
    })

})


// show route for the cats
router.get('/:id', (req, res) => {
  // finds the cat you want to show in the db
    Cat.findById(req.params.id, (err, catFromTheDatabase) => {
      // finds the use with the cat's id in its cats arr
      User.findOne({"cats": req.params.id}, (err, user) => {
        // renders the cats show page
        res.render('cats/show.ejs', {
          // defines variables as the found cat and the found user
          catOnTheTemplate: catFromTheDatabase,
          user: user
        });
      })
    })
   })


// get route for the edit page
router.get('/:id/edit', (req, res)=>{
  // finds the cat you want to edit from the db
    Cat.findById(req.params.id, (err, catFromTheDatabase)=>{
      // finds all of the users to select from
        User.find({}, (err, usersFromTheDatabase)=>{
          // renders the cats edit page
            res.render('cats/edit.ejs', {
              // defines the variables for the cat you want to edit and all of the potential users you found
                catOnTheTemplate: catFromTheDatabase,
                usersOnTemplate: usersFromTheDatabase
            });
        })

    })
})


// post route for the cats
router.post('/', (req, res)=>{
    // creates a new cat in the database from the submitted form
    Cat.create(req.body, (err, newlyCreatedCat)=>{
      // finds the created cat's user
        User.findById(req.body.userId, function(err, userFound)
        {
          // adds the cat to the cats arr
            userFound.cats.push(newlyCreatedCat._id);
          // saves the edited user
            userFound.save((err, savedUser)=>{
              // redirects to cats homepage
                res.redirect('/cats')
            });
        });

    })
})


// put route for cats
router.put('/:id', (req, res)=>{
    // finds a cat by its id and updates it with submitted form
    Cat.findByIdAndUpdate(req.params.id, req.body, {new: true},(err, updatedCat)=>{
      // finds the cat's user
      User.findOne({'cats': req.params.id}, (err, foundUser) => {
        // if the user changes
        if(foundUser._id.toString() !== req.body.userId){
          // removes the cat from its og user
          foundUser.cats.remove(req.params.id);
          // saves the edited og user
          foundUser.save((err, savedFoundUser) => {
            // finds the cats new user
            User.findById(req.body.userId, (err, newUser) => {
              // adds the cat to the new user's cats array
              newUser.cats.push(updatedCat._id);
              // saves the cat's new user
              newUser.save((err, savedNewUser) => {
                // redirects to the cats showpage
                res.redirect('/cats/' + req.params.id);
              })
            })
          })
        } else {
          // redirects to the cats showpage
          res.redirect('/cats/' + req.params.id)
        }
      })
    });
  });

// delete route for cats
router.delete('/:id', (req, res)=>{
  // finds the cat and deletes it
    Cat.findByIdAndDelete(req.params.id, (err, catFromTheDatabase)=>{
        // finds the user that contains the cat
        User.findOne({'cats': req.params.id}, (err, foundUser)=>{
          // err check
            if(err){
                console.log(err)
            }else{
                // removes the cat from user's arr
                foundUser.cats.remove(req.params.id);
                // saves user
                foundUser.save((err, updatedUser)=>{
                  // redirects to the cats homepage
                    res.redirect('/cats');
                })
            };
        });
    });
});

// exports the router to be used as the app in server.js
module.exports = router;
