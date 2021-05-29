const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname +"/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
require('dotenv').config();
const PORT = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));

// Connect to our database
const uri = "mongodb+srv://" + process.env.DB_USER + "@cluster0.vab65.mongodb.net/toDoListDB";
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

// Create item schema
const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please check your data entry, name is missing."]
  }
});

const listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please check your data entry, name is missing."]
  },
  items: [itemsSchema]
});

// Create model for new items from Schema
const Item = new mongoose.model("Item", itemsSchema);

const List = new mongoose.model("List", listSchema);

// Create three new items
const item_1 = new Item({name: "Dev"});
const item_2 = new Item({name: "Duo"});
const item_3 = new Item({name: "Exercise"});

const defualtItems = [item_1, item_2, item_3];

// Initial day var as global
day = date.getDate();


app.get("/", function(req, res) {

  // Update day var to match current day
  day = date.getDate();

  // Query items from db
  const items = [];
  Item.find(function(err, results) {

    if (err) {
      console.log(err);

      // If the db has no default items, insert them and then redirect to call .get("/") again
    } else if (results.length === 0) {

      // Insert Items into db
      Item.insertMany(defualtItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully inserted items into db.");
        }
      });
      res.redirect("/");

    } else {
      // Put names of items into array items
      results.forEach(item => items.push(item));
      console.log(items);

      // Render template page
      res.render("lists", {
        headerTitle: day,
        newItems: items
      });
    }
  });
})

app.get("/:newList", function(req, res) {
  const searchForList = _.capitalize(req.params.newList);

  List.findOne({name: searchForList}, function(err, foundList) {
    if (!err) {
      if (foundList == null) {
        // Create new list
        const newList = new List({name: searchForList, items: defualtItems});
        newList.save();
        res.redirect("/" + searchForList);

      } else {
        // Render Found list
        res.render("lists", {
          headerTitle: foundList.name,
          newItems: foundList.items
        });
      }
    }
  });
});

app.get("/about", function(req, res) {
  res.render("about");
});


app.post("/", function(req, res) {
  //Add new item to the array items and then redirect to "/" root
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const newItem = new Item({name: itemName});

  if (listName === day) {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList) {
      if (err) {
        console.log(err);
      } else if (foundList != null) {
        foundList.items.push(newItem);
        foundList.save();
        res.redirect("/" + foundList.name);
      }
    });
  }

})

app.post("/delete", function(req, res) {
  // Delete item that was checked and then redirect to "/" root
  const deleteItemId = req.body.deleteItemId;
  const listName = req.body.list;

  if (listName === day) {
    Item.findByIdAndDelete(deleteItemId, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully deleted item with id: " + deleteItemId);
      }
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: deleteItemId}}}, function(err, foundList) {
      if (!err) {
        foundList.save();
        res.redirect("/" + listName);
      }
    })
  }

})


app.listen(PORT, function() {
  console.log("Server running on port " + PORT + ".")
})
