const express = require('express');
const mongoose = require('mongoose');
const Message =require('../model/message');
var bodyParser = require('body-parser')
const route = express();

// const {auth,requiresAuth} = require('express-openid-connect');
const res = require('express/lib/response');



ObjectId = require('mongodb').ObjectId;

// create application/json parser
var jsonParser = bodyParser.json()
 
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })
-


// route.post('/sendMessage' ,jsonParser, (req,res) => {
//     console.log(req.body.message);
//     const message = new Message({s
//         body:req.body.message,
//         sender:req.body.sender,
//         conversationId:req.body.id  
//     });

//     message.save()
//         .then((result) => {
//             res.send(result);
//         })
//         .catch((err) => 
//         console.log(err));
// })

 route.post('/getMessages', jsonParser, async(req,res) => {

 
    let responseArray = [];

    try{

            await Message.find({conversationId:ObjectId(req.body.id)}, (err,docs)=>{
            // console.log("this is the id that was sent: " +req.body.id )    
            responseArray = docs;
            // console.log(responseArray);
            // console.log("There was an error: " + err);
            res.send(responseArray);
            }).clone();

           


    // if(responseArray.length==0)
    //     res.send({"Error":"You have made this query too many times in succession. Please wait"})        
    // else res.send(responseArray);
    }catch (err) {
        console.log('error', err)
        res.status(500).json({error:'There was a Server Side Error!'})
    }

})


module.exports = route;