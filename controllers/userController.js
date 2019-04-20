const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Cat = require('../models/Cat');

router.get('/', (req, res)=>{
    //find all the cats, stored in a variable called cats
    User.find({}, (err, usersFromTheDatabase)=>{
        //render the index page from the cats folder
        res.render('users/index.ejs', {
            //send the catsfromthedatabase under the name cats
            usersOnTheTemplate: usersFromTheDatabase
            //this thing keeps repeating, i dont know what it does

        })
    })
})

router.get('/new', (req, res)=>{
    //find all the cat
    res.render('users/new.ejs');
    //render our new.ejs page
})

router.get('/:id', (req, res)=>{
    //show route
    User.findById(req.params.id) 
    //find each user by their unique Id
    .populate('cats')
    .exec((err, userFromTheDatabase)=>{
        if(err){
            res.send(err);
        //if there is an error send it 
        } else {
            res.render('users/show.ejs', {
        //otherwise just load the show page 
                userOnTheTemplate: userFromTheDatabase
        //this thing keeps repeating, i dont know what it does

            
            });
        }

    })
})

router.get('/:id/edit', (req, res)=>{
    //edit route
    User.findById(req.params.id, (err, userFromTheDatabase)=>{
    //find the user from the database
        res.render('users/edit.ejs', {
    //render edit.ejs page
            userOnTheTemplate: userFromTheDatabase
         //this thing keeps repeating, i dont know what it does

        })
    })
})

router.post('/', (req, res)=>{
    //create route
    User.create(req.body, (err, newlyCreatedUser)=>{
    //create a user with an individaul id calling it newly created user?
        console.log(newlyCreatedUser)
        res.redirect('/users')
    //redirect back to user homepage
    })
})

router.put('/:id', (req, res)=>{
    User.findByIdAndUpdate(req.params.id, req.body, (err, userFromTheDatabase)=>{
    //find by individual id and update// in the body // call back is searching from Users database
        console.log(userFromTheDatabase);
        res.redirect('/users');
    })
})

router.delete('/:id', (req, res)=>{
    User.findByIdAndDelete(req.params.id, (err, userFromTheDatabase)=>{
    //find the user by their unique id, it is a user from the database
        console.log(userFromTheDatabase);
        Cat.deleteMany({
        //using the cat model and using delete function
            _id: {
            //grabs individual id
                $in: userFromTheDatabase.cats
            //the cats that are saved in the database assosciated with each user
            }
        }, (err, data)=>{
        //I dont know what this line does, other than it is a callback
            console.log(data);
            res.redirect('/users');
        //redirect back to users page
        })
    })
})

module.exports = router;