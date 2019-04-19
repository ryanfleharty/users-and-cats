const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Cat = require('../models/Cat');

router.get('/', (req, res)=>{
    User.find({}, (err, usersFromTheDatabase)=>{
        res.render('users/index.ejs', {
            usersOnTheTemplate: usersFromTheDatabase
        })
    })
})

router.get('/new', (req, res)=>{
    res.render('users/new.ejs');
})

router.get('/:id', (req, res)=>{
    User.findById(req.params.id) 
    .populate('cats')
    .exec((err, userFromTheDatabase)=>{
        if(err){
            res.send(err);
        } else {
            res.render('users/show.ejs', {
                userOnTheTemplate: userFromTheDatabase
            });
        }

    })
})

router.get('/:id/edit', (req, res)=>{
    User.findById(req.params.id, (err, userFromTheDatabase)=>{
        res.render('users/edit.ejs', {
            userOnTheTemplate: userFromTheDatabase
        })
    })
})

router.post('/', (req, res)=>{
    User.create(req.body, (err, newlyCreatedUser)=>{
        console.log(newlyCreatedUser)
        res.redirect('/users')
    })
})

router.put('/:id', (req, res)=>{
    User.findByIdAndUpdate(req.params.id, req.body, (err, userFromTheDatabase)=>{
        console.log(userFromTheDatabase);
        res.redirect('/users');
    })
})

router.delete('/:id', (req, res)=>{
    User.findByIdAndDelete(req.params.id, (err, userFromTheDatabase)=>{
        console.log(userFromTheDatabase);
        Cat.deleteMany({
            _id: {
                $in: userFromTheDatabase.cats
            }
        }, (err, data)=>{
            console.log(data);
            res.redirect('/users');
        })
    })
})

module.exports = router;