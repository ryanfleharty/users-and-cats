const express = require('express');
const router = express.Router();
const Cat = require('../models/Cat');

router.get('/', (req, res)=>{
    Cat.find({}, (err, catsFromTheDatabase)=>{
        res.render('cats/index.ejs', {
            catsOnTheTemplate: catsFromTheDatabase
        })
    })
})

router.get('/new', (req, res)=>{
    res.render('cats/new.ejs');
})

router.get('/:id', (req, res)=>{
    Cat.findById(req.params.id, (err, catFromTheDatabase)=>{
        res.render('cats/show.ejs', {
            catOnTheTemplate: catFromTheDatabase
        });
    })
})

router.get('/:id/edit', (req, res)=>{
    Cat.findById(req.params.id, (err, catFromTheDatabase)=>{
        res.render('cats/edit.ejs', {
            catOnTheTemplate: catFromTheDatabase
        })
    })
})

router.post('/', (req, res)=>{
    Cat.create(req.body, (err, newlyCreatedCat)=>{
        console.log(newlyCreatedCat)
        res.redirect('/cats')
    })
})

router.put('/:id', (req, res)=>{
    Cat.findByIdAndUpdate(req.params.id, req.body, (err, catFromTheDatabase)=>{
        console.log(catFromTheDatabase);
        res.redirect('/cats');
    })
})

router.delete('/:id', (req, res)=>{
    Cat.findByIdAndDelete(req.params.id, (err, catFromTheDatabase)=>{
        console.log(catFromTheDatabase);
        res.redirect('/cats');
    })
})

module.exports = router;