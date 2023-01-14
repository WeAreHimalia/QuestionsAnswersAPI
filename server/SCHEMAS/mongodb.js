const mongoose = require("mongoose")
const mongoDB = "mongodb://127.0.0.1/qa"

mongoose.set('strictQuery', true)
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection
db.on("error", console.error.bind(console, "MongoDB connection error:"))

// Define schemas
const Schema = mongoose.Schema

const AnswerSchema = new Schema({
  asnwer_id: Number,
  body: String,
  date: Date,
  answerer_name: String,
  helpfulness: Number,
  photos: Array,
  question_ref: { type: Schema.Types.ObjectId, ref: "Question" }
})

const QusetionSchema = new Schema({
  product_id: String,
  question_id: Number,
  question_body: String,
  question_date: Date,
  asker_name: String,
  question_helpfulness: Number,
  reported: Boolean,
  answers: [{ type: Schema.Types.ObjectId, ref: "Answer" }]
})


// Compile model from schema
const Question = mongoose.model("Questions", QusetionSchema)
const Answer = mongoose.model("Answers", AnswerSchema)


// Test join schemas using Mongoose
// Make sure to drop your old database in between manual testing :)

module.exports = { Question, Answer }