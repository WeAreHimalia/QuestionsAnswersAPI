const mongoose = require("mongoose");
const mongoDB = "mongodb://127.0.0.1/qa";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Define a schema
const Schema = mongoose.Schema;

const QusetionSchema = new Schema({
  product_id: String,
  question_id: Number,
  question_body: String,
  question_date: Date,
  asker_name: String,
  question_helpfulness: Number,
  reported: Boolean
})

// Compile model from schema
const Products = mongoose.model("Products", ProductsSchema);

module.exports = Products;