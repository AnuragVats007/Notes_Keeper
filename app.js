//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");

const homeStartingContent = "";
var LoginInfo = {};

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


//Database
mongoose.connect("mongodb+srv://admin-anurag:anuraG@my-first-cluster.it0tdiq.mongodb.net/UsersDB");

const notesSchema = new mongoose.Schema({
  noteTitle: {
    type: String,
    required : true
  },
  noteBody: String
});

const Note = mongoose.model("Note", notesSchema);

const usersSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required : true
  },
  password: {
    type: String,
    required : true
  },
  notes: [notesSchema]
});


const User = mongoose.model("User", usersSchema);

//working of app


// get


app.get("/", function(req,res){
  res.render("login");
});

app.get("/signup", function(req,res){
  res.render("signup");
});

app.get("/home", function(req,res){
    User.find({name: LoginInfo.username, password: LoginInfo.password}, function(err,foundList){
      if(!err)
      {
        // console.log(foundList);
        res.render("home",{
          postArray : foundList[0].notes
        });
      }
    });
});



app.get("/compose", function(req,res){
  res.render("compose");
});


app.get("/posts/:item", function(req,res){
  
  let param = _.lowerCase(req.params.item);
  // console.log(param);
  // console.log(req);

  //
  User.findOne({name: LoginInfo.username, password: LoginInfo.password}, function(err,found){
    // console.log(found);
    const notesList = found.notes;
    // console.log(notesList);
    notesList.forEach(function(e){
      if(_.lowerCase(e.noteTitle) === param)
      res.render("post", {
        postTitle: e.noteTitle,
        postContent: e.noteBody
      });
    });
  });
});


// post.......................................................................................

app.post("/signup",function(req,res){
    //register the user
    const signInInfo = req.body;
    // console.log(signInInfo);
    const newUser = User({
      name: signInInfo.username,
      email: signInInfo.email,
      password: signInInfo.password,
      notes: []
    });
    newUser.save();
    res.redirect("/");
});

app.post("/", function(req,res){
  LoginInfo = req.body;
  // console.log(LoginInfo);
  User.findOne({name: LoginInfo.username, password: LoginInfo.password}, function(err,found){
    // console.log(found);
    if(found)
    {
      res.redirect("/home");
    }
    else
    {
      res.redirect("/");
    }
  });
});

app.post("/home", function(req, res){
  // console.log(req.body);
  const newNote = Note ({
    noteTitle: req.body.postTitle,
    noteBody: req.body.post
  });
  User.findOne({name: LoginInfo.username, password: LoginInfo.password}, function(err,found){
    if(!err)
    {
      found.notes.push(newNote);
      found.save();
      res.redirect("/home");
    }
  });
});

app.post("/delete", function(req,res){
  const toDeleteId = req.body.button;
  User.findOneAndUpdate({name: LoginInfo.username, password: LoginInfo.password}, {$pull: {notes:{_id: toDeleteId}}}, function(err,foundList){
    if(!err)
    {
      res.redirect("/home");
    }
  });
});


app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
