const express = require("express");
const router = express.Router();
const User = require('../models/user');
const catchError = require('../utils/CatchError')
const passport = require('passport')
const { storeReturnTo } = require('../middleware');

router.get('/register',(req,res)=>{
    res.render('users/register')
})

router.post('/register',catchError(async(req,res)=>{
  
    try{
    const {username,email,password} =req.body;
    const user = await User({username,email});
    const registeredUser = await User.register(user,password);
    req.login(registeredUser, err =>{
        if(err){
            return next(err)
        }
        req.flash('success','succesfully register')
        res.redirect('/campground')
    })
  
    }
    catch(e){
        req.flash('error',e.message);
        res.redirect('/register')
    }
  
;}))



router.get('/login',(req,res)=>{
    res.render('users/login')
})
router.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), async (req, res) => {
    req.flash('success', 'Welcome back!');
    // Access the returnTo variable from the session
    const redirectUrl = res.locals.returnTo|| '/campground'; // Default to '/campground' if returnTo is not set
    res.redirect(redirectUrl);
});

router.get('/logout',(req,res,next)=>{
    req.logout(function(err){
        if(err){
            return next(err)
        }
        req.flash('success','good bye')
        res.redirect('/campground')
    })
})



module.exports = router;