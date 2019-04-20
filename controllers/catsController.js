const express = require('express');
const router = express.Router();
const Cat = require('../models/Cat');
const User = require('../models/User');

router.get('/', (req, res)=>{
//index route
    Cat.find({}, (err, catsFromTheDatabase)=>{
    //Cat model, display all cats from the cats database
    
        res.render('cats/index.ejs', {
    //render index page
            catsOnTheTemplate: catsFromTheDatabase
    //Im not sure what this means yet
        })
    })
})

router.get('/new', (req, res)=>{
    //new route
    User.find({}, (error, allUsers) => {
    //add all the users, so the client can select which each cat belong to
        if(error) {
            res.send(error)
        //if error occurs send the error
        } else {
            res.render('cats/new.ejs', {
        //else render this page 
                usersOnTemplate: allUsers
        //I dont know what this line does yet
            })
        }
    })

})
//show route 
router.get('/:id', (req, res) => {
    Cat.findById(req.params.id, (err, catFromTheDatabase) => {
    //find each individual cat by Id from the cat database, req.params.id is the articles id, 
      User.findOne({
    //find by id
        "cats": req.params.id
        //I am not sure what this line is doing other than calling cats by its unique id
      }, (err, user) => {
        //callback? 
        res.render('cats/show.ejs', {
        //render show page
          catOnTheTemplate: catFromTheDatabase,
        //im not sure what this line does yet
          user: user
        //this one either
        });
      })
    })
   })

router.get('/:id/edit', (req, res)=>{
//edit route
    Cat.findById(req.params.id, (err, catFromTheDatabase)=>{
    //find cat by unique id in the database of cats
        User.find({}, (err, usersFromTheDatabase)=>{
        //find all users from the database
            res.render('cats/edit.ejs', {
        //render the cats edit page 
                catOnTheTemplate: catFromTheDatabase,
                usersOnTemplate: usersFromTheDatabase
            });
        })

    })
})


router.post('/', (req, res)=>{
    console.log(req.body);
    Cat.create(req.body, (err, newlyCreatedCat)=>{
        // use the create model, using req.body to make a newlyCreatedCat
        console.log(`Created a cat for user ${req.body.userId}`);
        User.findById(req.body.userId, function(err, userFound)
        //find a user by its unique Id, call it UserFound
        {
            userFound.cats.push(newlyCreatedCat._id);
            userFound.save((err, savedUser)=>{
        //Use the found user and push it into a new 'savedUser'
                console.log(savedUser);
                res.redirect('/cats')
            //redirect back to cats index
            });
        });

    })
})

//put route for cats
router.put('/:id', (req, res)=>{
    console.log(req.body);
    Cat.findByIdAndUpdate(req.params.id, req.body, {new: true},(err, updatedCat)=>{
   //finds a cat by its id and updates it with form
      User.findOne({'cats': req.params.id}, (err, foundUser) => {
          //finds cats user
        if(foundUser._id.toString() !== req.body.userId){
            //if the user changes
          foundUser.cats.remove(req.params.id);
          //remove the cat from original owner
          foundUser.save((err, savedFoundUser) => {
              //saves user
            User.findById(req.body.userId, (err, newUser) => {
                //makes a new user
              newUser.cats.push(updatedCat._id);
              //adds the cat to the new cats array
              newUser.save((err, savedNewUser) => {
                  //sav cats new user 
                res.redirect('/cats/' + req.params.id);
                //redirects to cats index
              })
            })
          })
        } else {
          res.redirect('/cats/' + req.params.id)
          //redirect to cats show page
        }
      })
    });
  });


router.delete('/:id', (req, res)=>{
    // delete route
    Cat.findByIdAndDelete(req.params.id, (err, catFromTheDatabase)=>{
    // find each individiual cat by its id(req.pararms.id), from the cat datbase
        console.log(catFromTheDatabase);
        User.findOne({'cats': req.params.id}, (err, foundUser)=>{
        //find one cat by its id, callback to a foundUser 
            if(err){
                console.log(err)
            // if there is an error, console it
            }else{
                console.log(foundUser);
                foundUser.cats.remove(req.params.id);
                //by using the found user above, remove it by its unique identifier
                foundUser.save((err, updatedUser)=>{
                //save the found user in a new called updatedUser
                    console.log(updatedUser);
                    res.redirect('/cats');  
                //redirect back to the cats index
                })
            };
        });
    });
});

module.exports = router;