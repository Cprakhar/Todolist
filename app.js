//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require('lodash');
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://Pchhalotre:Sonu321chh@cluster0.zwg3xv4.mongodb.net/todolistDB');

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model('Item', itemSchema);
const item1 = new Item({
  name: 'Welcome to todolist'
});
const item2 = new Item({
  name: 'Hit + button to add new item'
});
const item3 = new Item({
  name: '<-- Hit to delete the item'
});

const defaultItem = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model('List', listSchema);

app.get("/", function(req, res) {

  Item.find(function(err, founditems){
    if(founditems.length === 0){
      Item.insertMany(defaultItem, function(err){
        if(!err){
          console.log('Successfully added the defaultitems to db');
        }
      });
      res.redirect('/');
    }else{
      res.render("list", {listTitle: "Today", newListItems: founditems});
    }
  });
});

app.post("/", function(req, res){

  const addItem = req.body.newItem;
  const listName = req.body.list;
  const newItem = new Item({
    name: addItem
  });

  if(listName === 'Today'){
    newItem.save();
    res.redirect('/');
  }else{
    List.findOne({name: listName}, function(err, foundlist){
      if(!err){
        foundlist.items.push(newItem);
        foundlist.save();
        console.log('Successfully added item to a custom list');
        res.redirect('/'+listName);
      }
    });
  }
});

app.post('/delete', function(req, res){
  const deleteItem = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === 'Today'){
    Item.findByIdAndRemove(deleteItem, function(err){
      if(!err){
        console.log('Successfully deleted the item');
        res.redirect('/');
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: deleteItem}}}, function(err){
      if(!err){
        console.log('Successfully deleted from custom list');
        res.redirect('/'+listName);
      }
    });
  }
  
});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundlist){
    if(!err){
      if(!foundlist){
        const list = new List({
        name: customListName,
        items: defaultItem
      });
        list.save();
        res.redirect('/'+customListName);
      }else{
        res.render('list', {listTitle: foundlist.name, newListItems: foundlist.items});
      }
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
