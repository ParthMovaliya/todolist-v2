const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
mongoose.set("strictQuery",true);

mongoose.connect('mongodb+srv://ParthMovaliya:PaRtH55055@cluster0.3s65ydr.mongodb.net/todolistDB',{useNewUrlParser: true});

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemSchema =new mongoose.Schema({
  name:String
});
const Item = mongoose.model("Item",itemSchema);

const listSchema = {
  name:String,
  items:[itemSchema]
};

const item_1 = new Item({name:"Welcome To your ToDo list"});
const item_2 = new Item({name:"Hit the + button to add a new task"});
const item_3 = new Item({name:"<-- Hit this to delete a Task"});

const defaultItems = [item_1,item_2,item_3]

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  Item.find({} , function(err , foundItems){
    if(foundItems.length === 0){
      const item1 = Item.insertMany(defaultItems).then(function(){
        console.log("inserted");
      }).catch(function(){
        console.log(err);
      });
    }
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  
  let data = new Item({name:itemName});

  if(listName === "Today"){
    data.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName},function(err,foundList){
      foundList.items.push(data);
      foundList.save();
      res.redirect("/"+listName);
    })
  }

});

app.get("/:customList",(req,res)=>{
  const customListName = _.capitalize(req.params.customList);

  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      } else {
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  })

})

app.get("/about", function(req, res){
  res.render("about");
});

app.post("/delete",(req,res)=>{
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("SucessFul Checked");
        res.redirect("/");
      }
    });
  } else {
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.pull({ _id: checkedItemId }); 
      foundList.save(function(){
          res.redirect("/" + listName);
      });
    });
  }

});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
