const express = require('express');
const mongoose = require('mongoose');
const Conversation =require('../model/conversation');
var bodyParser = require('body-parser')
const route = express();



// create application/json parser
var jsonParser = bodyParser.json()
 
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })
-


route.post('/createConversation', jsonParser, (req,res) => {
    
    const conversation = new Conversation({
        participants: req.body.participants        
    });

    conversation.save()
        .then((result) => {
            res.send(result);
            console.log(result);
        })
        .catch((err) => 
        console.log(err));
})

route.post('/getConversations',jsonParser, async(req,res) => {

 
    let responseArray = [];

    try{

            await Conversation.find({participants:req.body.participant}, (err,docs)=>{
          
            responseArray = docs;
            // console.log(responseArray);
            // console.log("There was an error: " + err);
            res.send(responseArray);
            }).clone();


    }catch (err) {
        console.log('error', err)
        res.status(500).json({error:'There was a Server Side Error!'})
    }

})

route.post('/deleteConversation',jsonParser, async(req,res) => {
    try{
        await Conversation.deleteOne({_id:req.body.id})
        res.status(200).json({message:"Deleted the conersation:" +req.body.id })
    }catch(e)
    {
        console.log("there was an issue deleting this convoersation : " + e)
    }
    
    
})

module.exports = route;