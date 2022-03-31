const express = require('express');
const mongoose = require('mongoose');
const User =require('../model/user');
var bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const route = express();
//authorization 


//Bcrypt
const bcrypt = require('bcryptjs');
const saltRounds = 10;
// create application/json parser
var jsonParser = bodyParser.json()
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

route.get('/protected', function(req,res)
{
    console.log("yay you made it through the protected route");
})

route.post('/login', jsonParser, async function(req,res){
    // auth user 
    try{
         await User.find({email: req.body.email.toLowerCase()}, (err, docs) =>{
            if(docs.length!=0)
            {
                console.log(docs);
                bcrypt.compare(req.body.password,docs[0].password,function (err,result) {
                    if(result)
                    {
                        const user = {email:req.body.email.toLowerCase()};
                        const token = jwt.sign({user},process.env.SECRET, {expiresIn: "1h"} );
                        res.json({token:token, username:docs[0].username });
                    }
                    else
                    {
                        res.json({message:"password invalid"})
                    }
                })
                        
                } else { 
                    console.log("Could not find username");
                    res.json({message:"Could not find username in Database"});
                }
            }).clone();
    }catch (err) {
        console.log('error', err)
        res.status(500).json({error:'There was a Server Side Error!'})

    }

})


route.post('/addUser', jsonParser , (req,res) => {
    
    
    console.log("new user added:" + req.body.username);

    
    
    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
       
        const user = new User({
        username:req.body.username.toLowerCase(),
        email: req.body.email.toLowerCase(),
        password:hash
        
    });

    user.save()
        .then((result) => {
            res.send(result);
        })
        .catch((err) => 
        console.log(err));



      });
    

})

route.post('/checkUserName',jsonParser, async (req,res) =>
{
    try{
    
        await User.find({username:req.body.username}, (err,docs)=>{
            if(docs.length===0)
            {
                
                res.json({message:"available"});
            }
            
            else{
                res.json({message:"found"})
            }
        }).clone();
    }catch(err) {
        res.send({Message:"something went wrong" + err})
    }

})

route.get('/user', jsonParser, async function(req,res)
{
    
    const bearerHeader = req.headers["authorization"];
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    const ourToken = bearerToken;

    const decoded = jwt.verify(ourToken,process.env.SECRET);

    try{
    
        await User.findOne({username: decoded.user.username}, (err,docs)=>{
            console.log(docs)
            res.send(docs);
        }).clone();
    }catch(err) {
        res.send({Message:"something went wrong" + err})
    }

})



module.exports = route;