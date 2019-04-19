const express = require('express');
const router = express.Router();
const Cat = require('../models/Cat');
const User = require('../models/User');



//CATS INDEX
router.get('/', (req, res)=>{
//we are getting '/' for cats
    Cat.find({}, (err, catsFromTheDatabase)=>{
//serching through the Cats db for evrything via empty brackets. assigning it to variable
        res.render('cats/index.ejs', {
//rendering cats .ejs page
            catsOnTheTemplate: catsFromTheDatabase
//passing variable data from db to variable on show.ejs
        })
    })
})


// CATS NEW
router.get('/new', (req, res)=>{
//getting cats/new
    User.find({}, (error, allUsers) => {
//looking through Users db for all users
        if(error) {
            res.send(error)
        } else {
            res.render('cats/new.ejs', {
                usersOnTemplate: allUsers
//rendering cats/new page and passing variable of all users to user on template inside new.ejs
            })
        }
    })

})


//CATS SHOW
router.get('/:id', (req, res) => {
    Cat.findById(req.params.id, (err, catFromTheDatabase) => {
//looking through Cats DB and searching by id for specific cat via req.params.id
      User.findOne({
        "cats": req.params.id
        //looking through users db for all 'cats' with matching req.params.id
      }, (err, user) => {
        res.render('cats/show.ejs', {
          catOnTheTemplate: catFromTheDatabase,
          user: user
          //render cats shwp.ejs page and pass variable for both cats db and users.cats db
        });
      })
    })
   })


//CATS EDIT
router.get('/:id/edit', (req, res)=>{
    //get cats edit page
    Cat.findById(req.params.id, (err, catFromTheDatabase)=>{
    //look thorugh cats by ID for specific cat id to edit. Store in cat-from-db variable
        User.find({}, (err, usersFromTheDatabase)=>{
    //searching through specific user  for everything in order to add to our vaiables value in edit page
            res.render('cats/edit.ejs', {
                catOnTheTemplate: catFromTheDatabase,
                usersOnTemplate: usersFromTheDatabase
                //render edit page and pass variables for value on template 
            });
        })

    })
})

//CATS CREATE
router.post('/', (req, res)=>{
    console.log(req.body);
    Cat.create(req.body, (err, newlyCreatedCat)=>{
//inside Cats db we are creating new cat with our contents in req.body
        console.log(`Created a cat for user ${req.body.userId}`);
        User.findById(req.body.userId, function(err, userFound)
        //serching for user by ID and pushing new cat into his cats array
        {
            userFound.cats.push(newlyCreatedCat._id);
            userFound.save((err, savedUser)=>{
                //caving changes made in users array
                console.log(savedUser);
                res.redirect('/cats')
                //redirecting to cats homepage
            });
        });

    })
})


// CATS UPDATE
router.put('/:id', (req, res)=>{
    //mamking put rout to update page for specific cat
    console.log(req.body);
    Cat.findByIdAndUpdate(req.params.id, req.body, {new: true},(err, updatedCat)=>{
    //serching through acts db by id. Selecting specific cat by re.params.id and adding in req.body
      User.findOne({'cats': req.params.id}, (err, foundUser) => {
          //look thorugh Users db for cats array with matching req.params.id
        if(foundUser._id.toString() !== req.body.userId){
          foundUser.cats.remove(req.params.id);
          foundUser.save((err, savedFoundUser) => {
          //them remover it from users cats array, then save
            User.findById(req.body.userId, (err, newUser) => {
              newUser.cats.push(updatedCat._id);
              newUser.save((err, savedNewUser) => {
                res.redirect('/cats/' + req.params.id);
                //serch through new users cats array, push new cat, then save and redirect 
              })
            })
          })
        } else {
          res.redirect('/cats/' + req.params.id)
        }
      })
    });
  });


router.delete('/:id', (req, res)=>{
    Cat.findByIdAndDelete(req.params.id, (err, catFromTheDatabase)=>{
        console.log(catFromTheDatabase);
        User.findOne({'cats': req.params.id}, (err, foundUser)=>{
            if(err){
                console.log(err)
            }else{
                console.log(foundUser);
                foundUser.cats.remove(req.params.id);
                foundUser.save((err, updatedUser)=>{
                    console.log(updatedUser);
                    res.redirect('/cats');  
                })
            };
        });
    });
});

module.exports = router;