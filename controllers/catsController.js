const express = require('express');
const router = express.Router();
const Cat = require('../models/Cat');
const User = require('../models/User');

router.get('/', (req, res)=>{
    Cat.find({}, (err, catsFromTheDatabase)=>{
        res.render('cats/index.ejs', {
            catsOnTheTemplate: catsFromTheDatabase
        })
    })
})

router.get('/new', (req, res)=>{
    User.find({}, (error, allUsers) => {
        if(error) {
            res.send(error)
        } else {
            res.render('cats/new.ejs', {
                usersOnTemplate: allUsers
            })
        }
    })

})

router.get('/:id', (req, res) => {
    Cat.findById(req.params.id, (err, catFromTheDatabase) => {
      User.findOne({
        "cats": req.params.id
      }, (err, user) => {
        res.render('cats/show.ejs', {
          catOnTheTemplate: catFromTheDatabase,
          user: user
        });
      })
    })
   })

router.get('/:id/edit', (req, res)=>{
    Cat.findById(req.params.id, (err, catFromTheDatabase)=>{
        User.find({}, (err, usersFromTheDatabase)=>{
            res.render('cats/edit.ejs', {
                catOnTheTemplate: catFromTheDatabase,
                usersOnTemplate: usersFromTheDatabase
            });
        })

    })
})


router.post('/', (req, res)=>{
    console.log(req.body);
    Cat.create(req.body, (err, newlyCreatedCat)=>{
        console.log(`Created a cat for user ${req.body.userId}`);
        User.findById(req.body.userId, function(err, userFound)
        {
            userFound.cats.push(newlyCreatedCat._id);
            userFound.save((err, savedUser)=>{
                console.log(savedUser);
                res.redirect('/cats')
            });
        });

    })
})

router.put('/:id', (req, res)=>{
    console.log(req.body);
    Cat.findByIdAndUpdate(req.params.id, req.body, {new: true},(err, updatedCat)=>{
      User.findOne({'cats': req.params.id}, (err, foundUser) => {
        if(foundUser._id.toString() !== req.body.userId){
          foundUser.cats.remove(req.params.id);
          foundUser.save((err, savedFoundUser) => {
            User.findById(req.body.userId, (err, newUser) => {
              newUser.cats.push(updatedCat._id);
              newUser.save((err, savedNewUser) => {
                res.redirect('/cats/' + req.params.id);
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
        res.redirect('/cats');
    })
})
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