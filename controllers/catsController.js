const express = require('express');
const router = express.Router();
const Cat = require('../models/Cat');
const User = require('../models/User');

// INDEX ROUTE
router.get('/', (req, res)=>{
    // find all the cats in the collection
    Cat.find({}, (err, catsFromTheDatabase)=>{
        // render the page that loops through and display all the cats
        res.render('cats/index.ejs', {
            // define the variable you've injected into the index template 
            // to reflect the array of cats you've found here
            catsOnTheTemplate: catsFromTheDatabase
        })
    })
})

// NEW ROUTE
router.get('/new', (req, res)=>{
    // find all the users in the collection
    User.find({}, (error, allUsers) => {
        // if an error returns, send it to the browser
        if(error) {
            res.send(error)
        // if there's no error:
        } else {
            // render the new page containing the new cat form
            res.render('cats/new.ejs', {
                // set the variable you use on the template to all the users
                // you found in this route
                usersOnTemplate: allUsers
            })
        }
    })

})

// SHOW ROUTE
router.get('/:id', (req, res) => {
    // find a cat by its unique id form the database
    Cat.findById(req.params.id, (err, catFromTheDatabase) => {
        // find the specific user who is associated with this particular
        // cat's id (above)
        User.findOne({
            "cats": req.params.id
            }, (err, user) => {
                // render the show page that displays the info for
                // this particular cat
                res.render('cats/show.ejs', {
                    // set the variables on the template to the 
                    // variables you found in the methods above
                    catOnTheTemplate: catFromTheDatabase,
                    user: user
                });
            })
        })
   })

// EDIT ROUTE
router.get('/:id/edit', (req, res)=>{
    // find one unique at by its id
    Cat.findById(req.params.id, (err, catFromTheDatabase)=>{
        // find all the users in the collection so that we can 
        // populate the drop-down with the existing users
        User.find({}, (err, usersFromTheDatabase)=>{
            // render the edit page that has the edit form on it
            res.render('cats/edit.ejs', {
                // set the template variables to the variables defined 
                // in this route
                catOnTheTemplate: catFromTheDatabase,
                usersOnTemplate: usersFromTheDatabase
            });
        })

    })
})

// POST ROUTE
router.post('/', (req, res)=>{
    // create a new cat using the submitted form information
    Cat.create(req.body, (err, newlyCreatedCat)=>{
        // find the specific user who is associated with this cat
        // according to the info submitted in the form
        User.findById(req.body.userId, function(err, userFound)
        {
            // using the found user, push into that person's array of 
            // cat objects the newly created cat from the form
            userFound.cats.push(newlyCreatedCat._id);
            // save this user's data since we just mutated the heck
            // out of it
            userFound.save((err, savedUser)=>{
                // take us back to the list of all the cats
                // where we will see we're one cat down
                res.redirect('/cats')
            });
        });

    })
})

// UPDATE ROUTE
router.put('/:id', (req, res)=>{
    // find and update one particular cat using the information submitted in the
    // edit form AND post the updated version of it
    Cat.findByIdAndUpdate(req.params.id, req.body, {new: true},(err, updatedCat)=>{
        // find the unique user that is associated with the cat 
        // we're currently dealing with (as found above)
        User.findOne({'cats': req.params.id}, (err, foundUser) => {
            // if the id of the user we just found is different from the
            // id selected from the drop down, do this stuff
            if(foundUser._id.toString() !== req.body.userId){
                // find the particular cat of this particular user and kill it
                foundUser.cats.remove(req.params.id);
                // save this user's data because we mutated it like crazy
                foundUser.save((err, savedFoundUser) => {
                    // for this particular user we found...
                    User.findById(req.body.userId, (err, newUser) => {
                        // push this updated and improved cat into this user's array
                        newUser.cats.push(updatedCat._id);
                        // save this updated user because we mutated their junk
                        newUser.save((err, savedNewUser) => {
                            // take us back to the updated cat's show page
                            res.redirect('/cats/' + req.params.id);
                        })
                    })
                })
            // if the id of the user we just found is the same as the
            // user selected in the form, redirect to the cat's show page
            } else {
                res.redirect('/cats/' + req.params.id)
            }
        })
    });
});

router.delete('/:id', (req, res)=>{
    // find a particular cat and delete it
    Cat.findByIdAndDelete(req.params.id, (err, catFromTheDatabase)=>{
        // find the user associated with this cat
        User.findOne({'cats': req.params.id}, (err, foundUser)=>{
            if(err){
                console.log(err)
            }else{
                // for this user, remove this cat from their cat array
                foundUser.cats.remove(req.params.id);
                // save this mutated user
                foundUser.save((err, updatedUser)=>{
                    // take us back to see all the cats, now without this one
                    res.redirect('/cats');  
                })
            };
        });
    });
});


module.exports = router;