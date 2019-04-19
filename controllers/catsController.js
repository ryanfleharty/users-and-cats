const express = require('express');
const router = express.Router();
const Cat = require('../models/Cat');
const User = require('../models/User');

router.get('/', (req, res)=>{
    // find empty array (to show all the cats) 
    Cat.find({}, (err, catsFromTheDatabase)=>{
        // render the index page from the cats folder
        res.render('cats/index.ejs', {
            // send  catsFromTheDatabase to catsOnTheTemplate 
            catsOnTheTemplate: catsFromTheDatabase
        })
    })
})

router.get('/new', (req, res)=>{
    // find the users (to show all users)
    User.find({}, (error, allUsers) => {
        if(error) {
            res.send(error)
        } else {
            // render the new page from the cats folder
            res.render('cats/new.ejs', {
                // send allUsers to userOnTemplate
                usersOnTemplate: allUsers
            })
        }
    })

})

router.get('/:id', (req, res) => {
    // find a specific cat from the cat database
    Cat.findById(req.params.id, (err, catFromTheDatabase) => {
        // the user of that cat 
      User.findOne({
          // based off of the cats id
        "cats": req.params.id
      }, (err, user) => {
          // render the show page from the cats folder
        res.render('cats/show.ejs', {
            // send catsFromTheDatabase to catOnTheTemplate
          catOnTheTemplate: catsFromTheDatabase,
          user: user
        });
      })
    })
   })

router.get('/:id/edit', (req, res)=>{
    // find specific cat from the cat database
    Cat.findById(req.params.id, (err, catFromTheDatabase)=>{
        // find array of users from the user database that is linked to the cat
        User.find({}, (err, usersFromTheDatabase)=>{
            // render the edit page from the cats folder
            res.render('cats/edit.ejs', {
                  // send catsFromTheDatabase to catOnTheTemplate
                catOnTheTemplate: catFromTheDatabase,
                //send usersFromTheDatabase to  usersOnTemplate
                usersOnTemplate: usersFromTheDatabase
            });
        })

    })
})


router.post('/', (req, res)=>{
    console.log(req.body);
    // creating a cat from the form(req.body) caliing it newlyCreated cat
    Cat.create(req.body, (err, newlyCreatedCat)=>{
       
        console.log(`Created a cat for user ${req.body.userId}`);
     // getting the id of the user who is creating the cat and getting the cat
        User.findById(req.body.userId, function(err, userFound)
        {
            // pushing the newly edited cat into the cat database 
            userFound.cats.push(newlyCreatedCat._id);
            // saving our new cat data
            userFound.save((err, savedUser)=>{
                console.log(savedUser);
                res.redirect('/cats')
            });
        });

    })
})

router.put('/:id', (req, res)=>{
    console.log(req.body);
    // finding the new cat, grabbing its id, grabbing its info from the form
    Cat.findByIdAndUpdate(req.params.id, req.body, {new: true},(err, updatedCat)=>{
        // finding the user of the cat 
      User.findOne({'cats': req.params.id}, (err, foundUser) => {
          // if the user we founds id is not equal to the user who edited the cat
        if(foundUser._id.toString() !== req.body.userId){
        
          foundUser.cats.remove(req.params.id);
          //save that users id info 
          foundUser.save((err, savedFoundUser) => {
              // new users id 
            User.findById(req.body.userId, (err, newUser) => {
                // push the new cat into the new users array
              newUser.cats.push(updatedCat._id);
               // save the new cat
              newUser.save((err, savedNewUser) => {
                  // redirect to the same cats page 
                res.redirect('/cats/' + req.params.id);
              })
            })
          })
        } else {
            // else if the new users id is equal to the user who edited the cat
            // just redirect 
          res.redirect('/cats/' + req.params.id)
        }
      })
    });
  });


router.delete('/:id', (req, res)=>{
    // find the cats id that we want tpo remove
    Cat.findByIdAndDelete(req.params.id, (err, catFromTheDatabase)=>{
        console.log(catFromTheDatabase);
        // find the user of that cats id 
        User.findOne({'cats': req.params.id}, (err, foundUser)=>{
            if(err){
                console.log(err)
            }else{
                console.log(foundUser);
                // remove that cat from its user
                foundUser.cats.remove(req.params.id);
                // save the new updated data 
                foundUser.save((err, updatedUser)=>{
                    console.log(updatedUser);
                    // redirect back to the cats index page 
                    res.redirect('/cats');  
                })
            };
        });
    });
});

module.exports = router;