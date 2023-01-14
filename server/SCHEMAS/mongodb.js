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
  question_id: Number,
  question_body: String,
  question_date: Date,
  asker_name: String,
  question_helpfulness: Number,
  reported: Boolean,
  answers: [{ type: Schema.Types.ObjectId, ref: "Answer" }],
  product_ref: { type: Schema.Types.ObjectId, ref: "QA" }
})

const QASchema = new Schema({
  product_id: String,
  results: [{ type: Schema.Types.ObjectId, ref: "Question" }]
})


// Compile model from schema
const QA = mongoose.model("QandAs", QASchema)
const Question = mongoose.model("Questions", QusetionSchema)
const Answer = mongoose.model("Answers", AnswerSchema)


// Test join schemas using Mongoose
// Make sure to drop your old database in between manual testing :)

// let sampleData = async () => {
//   try {
//     let product = await QA.create({
//       _id: new mongoose.Types.ObjectId(),
//       product_id: 123
//     })

//     let q1 = await Question.create({
//       _id: new mongoose.Types.ObjectId(),
//       question_id: 12345,
//       question_body: 'test',
//       question_date: '2022-08-21T00:00:00.000Z',
//       asker_name: 'mintest',
//       question_helpfulness: 4,
//       reported: false,
//       product_ref: product._id
//     })

//     let q2 = await Question.create({
//       _id: new mongoose.Types.ObjectId(),
//       question_id: 12333,
//       question_body: 'test-2',
//       question_date: '2022-08-21T00:00:00.000Z',
//       asker_name: 'mintest',
//       question_helpfulness: 4,
//       reported: false,
//       product_ref: product._id
//     })

//     let a1 = await Answer.create({
//       _id: new mongoose.Types.ObjectId(),
//       asnwer_id: 111,
//       body: 'test-a',
//       date: '2022-08-21T00:00:00.000Z',
//       answerer_name: 'String',
//       helpfulness: 45,
//       photos: [],
//       question_ref: q1._id
//     })

//     let a2 = await Answer.create({
//       _id: new mongoose.Types.ObjectId(),
//       asnwer_id: 114,
//       body: 'test-a-2',
//       date: '2022-08-21T00:00:00.000Z',
//       answerer_name: 'String-it',
//       helpfulness: 0,
//       photos: [],
//       question_ref: q2._id
//     })

//     Question.find()
//       .populate({
//         path: 'answers',
//         match: { question_ref: q1._id }
//       })
//       .exec((err, question) => {
//         if (err) {
//           console.log('err in question populate', err)
//         }
//         console.log('question result', question)
//       })

//   } catch (err) {
//     console.log('err somewhere in creation', err)
//   }
// }

// sampleData()

module.exports = { Question, Answer, QA }