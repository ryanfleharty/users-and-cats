// REQUIRE THE STUFF
const express = require('express');
const router = express.Router();
const Cat = require('../models/Cat');
const User = require('../models/User');

// 
router.get('/', (req, res)=>{
    Cat.find({}, (err, catsFromTheDatabase)=>{
        res.render('cats/index.ejs', {
            catsOnTheTemplate: catsFromTheDatabase
        })
    })
})

// NEW ROUTE
router.get('/new', (req, res)=>{
    // FIND ALL THE CATS, CALLBACK FOR THE RETURNED USERS
    User.find({}, (error, allUsers) => {
        // IF CHECK TO RETURN ERROR
        if(error) {
            //SEND ERROR TO PAGE IF ERROR
            res.send(error)
        } else {
            //RENDER THE NEW CAT PAGE
            res.render('cats/new.ejs', {
                //INJECT THE USERSONTEMPLATE VARIABLE TO THE PAGE EQUAL TO ALLUSERS RETURNED VALUE
                usersOnTemplate: allUsers
            })
        }
    })

})

//SHOW ROUTE
router.get('/:id', (req, res) => {
    // FIND THE SPECIFIC CAT BY THE ID OF THE ONE CLICKED ON, RETURN THAT CAT FROM DB
    Cat.findById(req.params.id, (err, catFromTheDatabase) => {
        //IN THE USERS COLLECTION, FIND ONE
      User.findOne({
          // FIND THE USER WHO HAS A CAT THAT MATCHES THE ID OF THIS CAT
        "cats": req.params.id
        // CALL BACK FUNCTION TO RENDER PAGE
      }, (err, user) => {
          // RENDER CAT SHOW PAGE WITH THE INJECTED VARIABLES RETURNED CAT AND SPECIFIC USER FROM QUERY
        res.render('cats/show.ejs', {
          catOnTheTemplate: catFromTheDatabase,
          user: user
        });
      })
    })
   })

   //EDIT ROUTE
router.get('/:id/edit', (req, res)=>{
    // IN THE CAT COLLECTION, FIND THE SPECIFIC CATS ID OF THE CLICKED ON CAT AND RETURN THAT CAT
    Cat.findById(req.params.id, (err, catFromTheDatabase)=>{
        // FIND THE USER ASSOCIATED WITH THAT RETURNED CAT FROM DB
        User.find({}, (err, usersFromTheDatabase)=>{
            // TAKE THAT USER AND CAT DATA AND RETURN THE CATS EDIT PAGE WITH 
            // INJECTED VARIABLES OF THE CAT AND USERS
            res.render('cats/edit.ejs', {
                catOnTheTemplate: catFromTheDatabase,
                usersOnTemplate: usersFromTheDatabase
            });
        })

    })
})

// CREATE ROUTE
router.post('/', (req, res)=>{
    //LOG THE DATA COMING FROM THE CLIENT TO MAKE SURE IT IS THE THING YOU ARE CREATING
    console.log(req.body);
    //CREATE THE CAT IN THE DB USING THE DATA FROM THE CLIENT (REQ.BODY) AND RETURN THE NEWLYCREATEDCAT
    Cat.create(req.body, (err, newlyCreatedCat)=>{
        //LOG THE USERS ID WHO CREATED THE CAT
        console.log(`Created a cat for user ${req.body.userId}`);
        // FIND THE USER BY ID WHO MATCHES THE ID FROM THE CLIENT AND RETURN THAT USER FROM THE DB
        User.findById(req.body.userId, function(err, userFound)
        // DO THE STUFF
        {
            //PUSH THE NEW CAT IN TO THE USERS CATS ARRAY WHO CREATED IT
            userFound.cats.push(newlyCreatedCat._id);
            //SAVE THE UPDATED USER DATA
            userFound.save((err, savedUser)=>{
                console.log(savedUser);
                //REDIRECT TO THE CATS HOME PAGE
                res.redirect('/cats')
            });
        });

    })
})


//UPDATE ROUTE
router.put('/:id', (req, res)=>{
    //LOG THE DATA THAT WE'LL BE USING FROM THE CLIENT TO UPDATE
    console.log(req.body);
    //IN THE CAT COLLECTION, FIND THE CAT ASSOCIATED WITH THE SPECIFIC ID AND UPDATE IT WITH THE 
    //REQ.BODY DATA
    Cat.findByIdAndUpdate(req.params.id, req.body, {new: true},(err, updatedCat)=>{
        //FIND THE USER WHO'S CATS ARRAY CONTAINS THE ID FROM THE PARAMS ABOVE, RETURN THAT USER
      User.findOne({'cats': req.params.id}, (err, foundUser) => {
          //IF CHECK TO SEE IF THE USER ID OF THE FOUND USER MATCHES THE CLIENT USER INFO
        if(foundUser._id.toString() !== req.body.userId){
            //IF THE USER IS DIFFERENT/NEW, THEN REMOVE THE ID OF THIS CAT FROM THE CATS ARRAY OF THE 
            //FOUND USER
          foundUser.cats.remove(req.params.id);
            //SAVE TEH UPDATED USER DATA, RETURN THE SAVED UPDATED USER DATA
          foundUser.save((err, savedFoundUser) => {
              //FIND THE USER WHOS ID MATCHES THE ID FROM THE BODY, RETURN THE NEW USER
            User.findById(req.body.userId, (err, newUser) => {
                //PUSH THE UPDATED CAT ID IN TO THE NEW USERS CATS ARRAY
              newUser.cats.push(updatedCat._id);
              //SAVE THE UPDATED USER DATA
              newUser.save((err, savedNewUser) => {
                  //REDIRECT TO THE CATS/:ID PAGE OF THE SPECIFIC UPDATED CAT (SHOW PAGE)
                res.redirect('/cats/' + req.params.id);
              })
            })
          })
        } else {
            //IF ITS THE SAME USER AS BEFORE, JUST GO BACK TO THE CAT'S SHOW PAGE
          res.redirect('/cats/' + req.params.id)
        }
      })
    });
  });


//DELETE ROUTE  
router.delete('/:id', (req, res)=>{
    // IN THE CATS COLLECTION, FIND THE ONE MATCHING THE CLICKED ON CAT ID AND RETURN THAT CAT FROM THE DB
    Cat.findByIdAndDelete(req.params.id, (err, catFromTheDatabase)=>{
        //LOG THE CAT TO MAKE SURE ITS THE ONE
        console.log(catFromTheDatabase);
        //FIND THE USER IN THE USERS COLLECTION WHO OWNS THE CAT IN THEIR CATS ARRAY
        User.findOne({'cats': req.params.id}, (err, foundUser)=>{
            //CHECK IF THE RETURN IS AN ERROR
            if(err){
                //LOG THE FRIGGIN ERROR
                console.log(err)
                //OOOOOOTHERWISE.... 
            }else{
                // LOG THE USER WHO OWNS THE CAT
                console.log(foundUser);
                // REMOVE THE CAT FROM THAT USERS CAT ARRAY BY THE PARAMS ID
                foundUser.cats.remove(req.params.id);
                // SAVE THE UPDATED USER DATA
                foundUser.save((err, updatedUser)=>{
                    // LOG THE UPDATED DATA
                    console.log(updatedUser);
                    // REDIRECT TO THE CATS HOME PAGE
                    res.redirect('/cats');  
                })
            };
        });
    });
});

module.exports = router;