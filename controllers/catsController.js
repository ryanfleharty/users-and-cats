const express = require('express');
const router = express.Router();
const Cat = require('../models/Cat');
const User = require('../models/User');

router.get('/', (req, res)=>{
    //find all the cats living in the database, called catsFromTheDatabase
    Cat.find({}, (err, catsFromTheDatabase)=>{
    //render a page called 'index.ejs' that holds a list of 
    //all the cats that have been / will be created 
        res.render('cats/index.ejs', {
    //give a variable name to represent the array of cats exisitng on
    //the database, so that you can loop through them on your index.ejs
    //and make them appear on the page
            catsOnTheTemplate: catsFromTheDatabase
        })
    })
})

router.get('/new', (req, res)=>{
    //find all the users that we've created 
    User.find({}, (error, allUsers) => {
    //make sure there is no error
        if(error) {
            res.send(error)
    //if no error, render the new.ejs page to create a new cat
        } else {
            res.render('cats/new.ejs', {
    //give a variable to define all of the users that are on the 
    //database, so that you can have them appear in a toggle down
    //list to choose from when creating a new cat
                usersOnTemplate: allUsers
            })
        }
    })

})

router.get('/:id', (req, res) => {
    //find all the cats within the database based on their id number
    Cat.findById(req.params.id, (err, catFromTheDatabase) => {
    //fine the specific cat you are wanting to show (happens when you
    //click the show button associated with the cat at that id number)
      User.findOne({
    //redefine the id number of that cat as 'cats'
        "cats": req.params.id
      }, (err, user) => {
    //render new page to show the cat and it's details
        res.render('cats/show.ejs', {
    //redefine the array of cats that are in the database 
    //as cats that live on the template 
          catOnTheTemplate: catFromTheDatabase,
    //refefine the user on the database associated with the cat as an object 
    //that can have it's information accessed and displayed
          user: user
        });
      })
    })
   })

router.get('/:id/edit', (req, res)=>{
    //find all cats by their id number
    Cat.findById(req.params.id, (err, catFromTheDatabase)=>{
    //find all the users 
        User.find({}, (err, usersFromTheDatabase)=>{
            //render an edit page
            res.render('cats/edit.ejs', {
            //take all the cats from the database and make them
            //able to be accessed on click 
                catOnTheTemplate: catFromTheDatabase,
            //create a drop down of users
                usersOnTemplate: usersFromTheDatabase
            });
        })

    })
})


router.put('/:id', (req, res)=>{
    console.log(req.body);
    //find all cats by it's id and parse through it's body to get all it's information
    //in a way that is accessible
    Cat.findByIdAndUpdate(req.params.id, req.body, {new: true},(err, updatedCat)=>{
        //find one cat with a specific id (the one that you are clicking)
      User.findOne({'cats': req.params.id}, (err, foundUser) => {
          //if the editor changes the user...
        if(foundUser._id.toString() !== req.body.userId){
            //remove the cat from that user's array of cats
          foundUser.cats.remove(req.params.id);
          //save user's info
          foundUser.save((err, savedFoundUser) => {
              //find user by it's id
            User.findById(req.body.userId, (err, newUser) => {
                //push the cat who's id has been accessed 
                //into the selected user's array of cats
              newUser.cats.push(updatedCat._id);
                //save new user's inforamtion
              newUser.save((err, savedNewUser) => {
                //re direct to the cat's show page that has been edited
                res.redirect('/cats/' + req.params.id);
              })
            })
          })
        } else {
            //if not, refresh the page
          res.redirect('/cats/' + req.params.id)
        }
      })
    });
  });


  router.post('/', (req, res)=>{
    console.log(req.body);
    //create a new cat!! parse through the body of the information 
    //created and form a new id/etc.
    Cat.create(req.body, (err, newlyCreatedCat)=>{
        console.log(`Created a cat for user ${req.body.userId}`);
        //find the user by it's id and attach the cat to a specific
        //user (aka push the cat's id into it's array of cats)
        User.findById(req.body.userId, function(err, userFound)
        {
            //which will happen now
            userFound.cats.push(newlyCreatedCat._id);
            //and then it'll be saved
            userFound.save((err, savedUser)=>{
                console.log(savedUser);
            //and then it will be redirected to the index of cats
                res.redirect('/cats')
            });
        });

    })
})

router.delete('/:id', (req, res)=>{
    //find all the cats by their id numbers
    Cat.findByIdAndDelete(req.params.id, (err, catFromTheDatabase)=>{
        console.log(catFromTheDatabase);
        //find a specific cat that has the id of the cat you've clicked
        //on
        User.findOne({'cats': req.params.id}, (err, foundUser)=>{
            if(err){
                //if theres a problem, tell me what it is!!!!
                console.log(err)
            }else{
                //if not, remove the cat from the specific user's array of cats
                console.log(foundUser);
                foundUser.cats.remove(req.params.id);
                //save that user's new information
                foundUser.save((err, updatedUser)=>{
                    console.log(updatedUser);
                //redirect to the cats index page
                    res.redirect('/cats');  
                })
            };
        });
    });
});

module.exports = router;