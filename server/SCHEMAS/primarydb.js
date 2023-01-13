const mongoose = require("mongoose");
const mongoDB = "mongodb://127.0.0.1/qa";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Define a schema
const Schema = mongoose.Schema;

const AnswerSchema = new Schema({
  asnwer_id: Number,
  body: String,
  date: Date,
  answerer_name: String,
  helpfulness: Number,
  photos: Array
})

const QusetionSchema = new Schema({
  question_id: Number,
  question_body: String,
  question_date: Date,
  asker_name: String,
  question_helpfulness: Number,
  reported: Boolean,
  answers: [AnswerSchema]
})

const QA = new Schema({
  product_id: String,
  results[QusetionSchema]
})


// Compile model from schema
const Question = mongoose.model("Questions", QusetionSchema)
const Answer = mongoose.model("Answers", AnswerSchema)
const QA = mongoose.model("QandAs", QA)

module.exports = { Question, Answer, QA }