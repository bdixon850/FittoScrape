//Dependencies
const mongoose = require('mongoose');
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');

//Scraping
const cheerio = require('cheerio');
const axios = require('axios');

//Require models
const db = require('./models');

// Connect to Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://bdixon:senior07@ds015995.mlab.com:15995/heroku_gfww1g7b";
mongoose.connect(MONGODB_URI);
// Set mongoose to leverage built in JavaScript ES6 Promises
// mongoose.Promise = Promise;

//Initialize Express
const PORT = process.env.PORT || 8080;
const app = express();

//Middleware
// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Routes
app.get("/", function(req, res) {
  res.send(index.html);
});

//Scraping route
app.get("/scrape", function(req, res) {
  //Grab the body of the html with axios
  axios.get("https://www.nytimes.com/section/us").then(function(response) {
    //Then load that into cheerio and save it to $ for a shorthand selector

    var $ = cheerio.load(response.data);

    //Now grab every article tag and do the following
    $(".css-4jyr1y").each(function(i, element) {
      //Save an empty result object
      var result = {};
      
      //Add the text, href and summary of every link, and save them as properties of the result object
      result.title = $(this)
        .find("h2")
        .text();

        // console.log("TITLE ELEMENT", result.title)
      result.link = $(this)
        .children("a")
        .attr("href");

      summary = ""
      if ($(this).find("ul").length) {
        summary = $(this).find("li").first().text();
      } else {
        summary = $(this).find("p").text();
      };

      result.summary = summary;
      // console.log(result);


      //Create a new Article using the result object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurs, log it
          console.log(err);
        });
    });

    //Send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      //If an error occurs, sent it to the client
      res.log(err)
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  //Using the id passed in the id parameter, prepare a query that finds the matching one in our database
  db.Article.findOne({ _id: req.params.id })

  // Populate all of the notes associated with it
  .populate("note")
  .then(function(dbArticle) {
    // If successful, send it to the client
    res.json(dbArticle);
  })
  .catch(function(err) {
    // If an error occured, send it to the client
    res.json(err);
  });
});

//Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    })
})

// Route for saving/updating article to be saved
app.put("/saved/:id", function(req, res) {
  db.Article.findByIdAndUpdate({ _id: req.params.id })
  .then(function(dbArticle) {
    res.json(dbArticle);
  })
  .catch(function(err) {
    res.json(err);
  });
});

// Route for getting saved articles
app.get("/saved", function(req, res) {
  db.Article.find({ isSaved: true })
  .then(function(dbArticle) {
    res.json(dbArticle);
  })
  .catch(function(err) {
    res.json(err);
  });
});

// Route for deleting/updating saved articles
app.put("/delete/:id", function(req, res) {
  db.Article.findByIdAndUpdate({ _id: req.params.id } , { set: { isSaved: false}})
  .then(function(dbArticle) {
    res.json(dbArticle);
  })
  .catch(function(err) {
    res.json(err);
  });
});


app.listen(PORT, function() {
  console.log("App is listening on port: ", PORT);
});