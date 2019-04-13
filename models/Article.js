var mongoose = require("mongoose");

// Save a refrence to the Schema constructor
var Schema = mongoose.Schema;

//Using the Schema constructor, create a new UserScheme object
var ArticleSchema = new Schema({

  title: {
    type: String,
    // required: true
  },

  link: {
    type: String,
    // required: true
  },

  summary: {
    type: String,
    required: false
  },

  isSaved: {
    type: Boolean,
    default: false,
    required: false
  },
  // `note` is an object that stores a Note id
  // The ref property links the ObjectId to the Note model
  // This allows us to populate the Article with an associated Note
  note: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Note'}],
  }
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article; //exporting Article