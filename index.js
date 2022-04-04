const express = require('express')
const app = express();
var jwt = require('express-jwt');
var jwks = require('jwks-rsa');
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin:"*",
        methods:["GET","POST"]
    }
});
const mongoose = require('mongoose');
 
require ('dotenv').config();


const Message =require('./model/message');
const User = require('./model/user');
const Conversation = require('./model/conversation');


var jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: "https://dev-gy1a3e07.us.auth0.com/.well-known/jwks.json"
  }),
    
  issuer: "https://dev-gy1a3e07.us.auth0.com/",
  algorithms: ['RS256']
});

  app.use(jwtCheck);


app.use(express.static('public'));

const cors = require('cors');
const corsOptions ={
    origin:'*', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cors(corsOptions));

var messageRoutes = require("./routes/messageRoutes");
app.use(messageRoutes);

var userRoutes = require("./routes/userRoutes");
app.use(userRoutes);

var conversationRoutes = require("./routes/conversationRoutes");
app.use(conversationRoutes);


app.get('/', (req,res) => {
    res.send(req.oidc.isAuthenticated() ? "Logged In" : "Logged Out")
})

app.get('/profile',  (req,res) => {
    res.send(JSON.stringify(req.oidc.user))
})

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.j3fag.mongodb.net/instantmessage?retryWrites=true&w=majority`; 
mongoose.connect(uri,{useNewUrlParser: true, useUnifiedTopology:true})
.then((result) => 
{
     console.log('connected to db'); 
     http.listen(process.env.PORT || 3000);
})
 .catch((err) => console.log(err));

 io.on('connection', socket => 
 {
    console.log("connected with id of: " +socket.id);
    // socket.emit("room-joined",{message:"you joined the room: " + socket.id})

    socket.on('send-message', (message,room,sender) =>
    {
        // io.to(room).emit('message-received');
        console.log("the message received says: " + message);
        // io.to(room).emit("message-confirmation",{confimationMessage:"server received message. Message said: " + message});

        console.log("sent message:" + message + " to room : " + room);
        //save message into mongodb
        const savedMessage = new Message({
            body:message,
            sender:sender,
            conversationId:room  
        });
    
        savedMessage.save()
            .then((result) => {
                // io.to(socket.id).emit("message-saved",result )
                // io.to(socket.id).emit("message-received",result)
                io.in(room).emit("message-received",result);
            })
            .catch((err) => 
            console.log(err));



    })
    socket.on('disconnect', ()=> {
        console.log("client disconnected")
    });

        socket.on('join-room', (room)=>{
         if(room.room !== "")
         {
         socket.join(room.room);
         console.log(socket.id + "just joined room :" +room.room)
        //  io.to(room).emit('room-joined',{message: "you just jointed the room:" + room.room})
         }})

         socket.on('getConversations',async (user)=>{

            let responseArray = [];

            try{
        
                    await Conversation.find({participants:user.user}, (err,docs)=>{
                  
                    responseArray = docs;
                   
                   
                    }).clone().then(()=>{
                          io.in(socket.id).emit('conversations',{conversationArray:responseArray});
                            console.log("getConversations was pinged and the response was:" + responseArray);
                    })
        
        
            }catch (err) {
                console.log('error', err)
                
            }

           
         })
        
         socket.on('notify-participants', (participants) =>{
            //  io.to(participants.participants[0])
            console.log("setn a notification to " +participants.participants[1] +"for them to refresh their conversation list");
             io.in(participants.participants[0]).emit("refresh-conversations");
             io.in(participants.participants[1]).emit("refresh-conversations");
            // io.in("elliottparedes").emit("refresh-conversations");
            // io.emit("refresh-conversations");
            console.log("setn a notification to " +participants.participants[0] +"for them to refresh their conversation list");
         })

         socket.on('delete-conversation', async(data) => {
            try{
                await Conversation.deleteOne({_id:data.data}).then(()=>{
                   console.log("deleted conversation with id:" + data.data)
                io.in(data.data).emit("refresh-conversations");
                socket.leave(data.data); 
                })
                
            }catch(e)
            {
                console.log("there was an issue deleting this conversation : " + e)
            }
         })

        socket.on('leave-room', (room) =>{
         if(room.room!=="")
         {
         socket.leave(room);
         console.log(socket.id + "Just left room: " + room.room);
         }
        
         //socket.emit('left-room',{message:"you just left the room:" + room.room});
         })


})