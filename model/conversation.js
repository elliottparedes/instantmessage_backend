const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversationSchema = new Schema({

    participants:{
        type:[]
    }});

const Conversation = mongoose.model("Conversation",conversationSchema);

module.exports = Conversation;