const express = require('express');
const router = express.Router();
const Cat = require('../models/Cat');
const User = require('../models/User');

router.get('/', (req, res)=>{
    //find all cats stored in the Cats db variable.
    Cat.find({}, (err, catsFromTheDatabase)=>{
        //render the index page from the cats folder.
        res.render('cats/index.ejs', {
            //send the cats from the db under the specific name.
            catsOnTheTemplate: catsFromTheDatabase
        })
    })
})

router.get('/new', (req, res)=>{
    //find all the users in the Users db variable.
    User.find({}, (error, allUsers) => {
        //error check.
        if(error) {
            res.send(error)
        } else {
            //render the page where we can create new cats.
            res.render('cats/new.ejs', {
                //send the users from the db 
                usersOnTemplate: allUsers
            })
        }
    })

})

router.get('/:id', (req, res) => {
    //find a specific cat based on the given id.
    Cat.findById(req.params.id, (err, catFromTheDatabase) => {
        //find the corresponding user who has that cat id in the 'cats' field.
      User.findOne({
        "cats": req.params.id
      }, (err, user) => {
          //render the show page for that specific cat.
        res.render('cats/show.ejs', {
            //send both the cats and users.
          catOnTheTemplate: catFromTheDatabase,
          user: user
        });
      })
    })
   })

router.get('/:id/edit', (req, res)=>{
    //find a specific cat based on the id.
    Cat.findById(req.params.id, (err, catFromTheDatabase)=>{
        //find the corresponding user associated w the cat.
        User.find({}, (err, usersFromTheDatabase)=>{
            //render the edit page for that specific cat.
            res.render('cats/edit.ejs', {
                //send the cats and users from dbs.
                catOnTheTemplate: catFromTheDatabase,
                usersOnTemplate: usersFromTheDatabase
            });
        })

    })
})


router.post('/', (req, res)=>{
    console.log(req.body);
    //create a new cat in the cat schema.
    Cat.create(req.body, (err, newlyCreatedCat)=>{
        console.log(`Created a cat for user ${req.body.userId}`);
        //find the desired corresponding user for that cat
        User.findById(req.body.userId, function(err, userFound)
        {
            //add the newly created cat the the corresponding owner/user.
            userFound.cats.push(newlyCreatedCat._id);
            //save it.
            userFound.save((err, savedUser)=>{
                console.log(savedUser);
                //redirect to our updated cats page.
                res.redirect('/cats')
            });
        });

    })
})

router.put('/:id', (req, res)=>{
    console.log(req.body);
    //find the unique id of the cat we're trying to update.
    Cat.findByIdAndUpdate(req.params.id, req.body, {new: true},(err, updatedCat)=>{
        //find the user id of the user who owns the specific cat.
      User.findOne({'cats': req.params.id}, (err, foundUser) => {
          //if there are updates...
        if(foundUser._id.toString() !== req.body.userId){
            //...do the updating: remove the old cat info,
          foundUser.cats.remove(req.params.id);
          //save the changes,
          foundUser.save((err, savedFoundUser) => {
              //find the correct info for the user we've updated the cat to being associated with.
            User.findById(req.body.userId, (err, newUser) => {
                //add that cat to that user,
              newUser.cats.push(updatedCat._id);
              //save,
              newUser.save((err, savedNewUser) => {
                  //redirect to the newly updated page showing the correct cat info.
                res.redirect('/cats/' + req.params.id);
              })
            })
          })
        } else {
            //if there were'nt any changes just go to the original cat page.
          res.redirect('/cats/' + req.params.id)
        }
      })
    });
  });


router.delete('/:id', (req, res)=>{
    //find the id of the cat we want to axe.
    Cat.findByIdAndDelete(req.params.id, (err, catFromTheDatabase)=>{
        console.log(catFromTheDatabase);
        //find the user who owns the cat to be deleted.
        User.findOne({'cats': req.params.id}, (err, foundUser)=>{
            if(err){
                console.log(err)
            }else{
                console.log(foundUser);
                //remove the cat from this user,
                foundUser.cats.remove(req.params.id);
                //save,
                foundUser.save((err, updatedUser)=>{
                    console.log(updatedUser);
                    //redirect back to the updated cats page.
                    res.redirect('/cats');  
                })
            };
        });
    });
});

module.exports = router;