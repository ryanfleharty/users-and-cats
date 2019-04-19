//cat controller controls the restful routes for cats

//make a variable for express and require it
const express = require('express');
//make a variable for the router equal to the method on the express object
const router = express.Router();
//import a reference to the cat model store it in a usable variable
const Cat = require('../models/Cat');
//import a reference to the user model store it in a variable
const User = require('../models/User');

//index route
//get the request from the client
router.get('/', (req, res)=>{
//query the db to find cats
    Cat.find({}, (err, catsFromTheDatabase)=>{
//send the cats to an ejs page that will display the data according to an ejs template 
        res.render('cats/index.ejs', {
//inject the template with the variable found from the db -- becomes new variable on in the template 
            catsOnTheTemplate: catsFromTheDatabase
        })
    })
})
//new route
//get a request for a new cat from the client
router.get('/new', (req, res)=>{
//search the db for created cats from the post route
    User.find({}, (error, allUsers) => {
//check for errors
        if(error) {
            res.send(error)
        } else {
//if no error respond to the client with an ejs page that shows created cat
            res.render('cats/new.ejs', {
//inject the variable onto the ejs page
                usersOnTemplate: allUsers
            })
        }
    })

})

//show page
// client requests to see a cat
router.get('/:id', (req, res) => {
//find the cat in the db using 
    Cat.findById(req.params.id, (err, catFromTheDatabase) => {
//check the database to see if the cat belongs to a user        
      User.findOne({
        "cats": req.params.id
      }, (err, user) => {
        res.render('cats/show.ejs', {
//inject the template with the cat variable and id of it's owner
          catOnTheTemplate: catFromTheDatabase,
          user: user
        });
      })
    })
   })

//edit route
//client requests to edit a cat
router.get('/:id/edit', (req, res)=>{
//search the db for the requested cat
    Cat.findById(req.params.id, (err, catFromTheDatabase)=>{
//search the db for the cats owner
        User.find({}, (err, usersFromTheDatabase)=>{
            res.render('cats/edit.ejs', {
//inject the edit page with the variables for the cat and its owner
                catOnTheTemplate: catFromTheDatabase,
                usersOnTemplate: usersFromTheDatabase
            });
        })

    })
})

//create/post route
//receives the req.body information from the form on the ejs
router.post('/', (req, res)=>{
    console.log(req.body);
//create a brand new cat with the information from the form
//form 'name' attributes match the catSchema
    Cat.create(req.body, (err, newlyCreatedCat)=>{
        console.log(`Created a cat for user ${req.body.userId}`);
//find the user from the input in the ejs
        User.findById(req.body.userId, function(err, userFound)
        {
//add the unique id from the user to the created cat object
            userFound.cats.push(newlyCreatedCat._id);
//save changes because we mutated an array in a DB
            userFound.save((err, savedUser)=>{
                console.log(savedUser);
//send the client to the cats page
                res.redirect('/cats')
            });
        });

    })
})
//update/put route
//req.body information received from edit.ejs
router.put('/:id', (req, res)=>{
    console.log(req.body);
//find the cat that the client requested to change in the db
    Cat.findByIdAndUpdate(req.params.id, req.body, {new: true},(err, updatedCat)=>{
//find the owner of the cat by querying the db for the cat key with the targeted value
      User.findOne({'cats': req.params.id}, (err, foundUser) => {
//if the owner id matched the form (or does not not match it), 
        if(foundUser._id.toString() !== req.body.userId){
//remove the cat from the user's object
          foundUser.cats.remove(req.params.id);
//save since we mutated an array on the db
          foundUser.save((err, savedFoundUser) => {
//find the user with the cat's reference in its object
            User.findById(req.body.userId, (err, newUser) => {
//push the new cats id to the user reference
              newUser.cats.push(updatedCat._id);
//save mutated array
              newUser.save((err, savedNewUser) => {
//redirect the route to cats show page
                res.redirect('/cats/' + req.params.id);
              })
            })
          })
        } else {
//redirect if the owners id does not match the information on req.body (cats reference in the owners object)
          res.redirect('/cats/' + req.params.id)
        }
      })
    });
  });
//delete route
//client requests to delete a cat (input from button on an ejs page)
router.delete('/:id', (req, res)=>{
//find the requested cat and delete it....but wait with a call back for the user information
    Cat.findByIdAndDelete(req.params.id, (err, catFromTheDatabase)=>{
        console.log(catFromTheDatabase);
//find the cats owner based on a db search of the cat object
        User.findOne({'cats': req.params.id}, (err, foundUser)=>{
            if(err){
                console.log(err)
            }else{
                console.log(foundUser);
//remove the user reference from the cat object
                foundUser.cats.remove(req.params.id);
//save because we mutated an array
                foundUser.save((err, updatedUser)=>{
                    console.log(updatedUser);
//redirect to the cat index
                    res.redirect('/cats');  
                })
            };
        });
    });
});
//export the router
module.exports = router;