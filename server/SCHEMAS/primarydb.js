const mongoose = require("mongoose")
const mongoDB = "mongodb://127.0.0.1/qa"

mongoose.set('strictQuery', true)
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection
db.on("error", console.error.bind(console, "MongoDB connection error:"))

// Define schemas
const Schema = mongoose.Schema

const AnswerSchema = new Schema ({
  asnwer_id: Number,
  body: String,
  date: Date,
  answerer_name: String,
  helpfulness: Number,
  photos: Array,
  question_ref: { type: Schema.Types.ObjectId, ref: "Questions" }
})

const QusetionSchema = new Schema ({
  question_id: Number,
  question_body: String,
  question_date: Date,
  asker_name: String,
  question_helpfulness: Number,
  reported: Boolean,
  answers: { type: Schema.Types.ObjectId, ref: "Answers" },
  product_ref: { type: Schema.Types.ObjectId, ref: "QandAs" }
})

const QASchema = new Schema ({
  product_id: String,
  results: [{ type: Schema.Types.ObjectId, ref: "Questions" }]
})


// Compile model from schema
const Answer = mongoose.model("Answers", AnswerSchema)
const Question = mongoose.model("Questions", QusetionSchema)
const QA = mongoose.model("QandAs", QASchema)

// Attempt to join schemas using Mongoose
// Make sure to drop your old database in between manual testing :)

// let sampleData = async () => {
//   try {
//     const product = await QA.create({
//       product_id: 123
//     })

//     const q1 = await Question.create({
//       question_id: 12345,
//       question_body: 'test',
//       question_date: '2022-08-21T00:00:00.000Z',
//       asker_name: 'mintest',
//       question_helpfulness: 4,
//       reported: false,
//       product_ref: product._id
//     })

//     const q2 = await Question.create({
//       question_id: 12333,
//       question_body: 'test-2',
//       question_date: '2022-08-21T00:00:00.000Z',
//       asker_name: 'mintest',
//       question_helpfulness: 4,
//       reported: false,
//       product_ref: product._id
//     })

//     const a1 = await Answer.create({
//       asnwer_id: 111,
//       body: 'test-a',
//       date: '2022-08-21T00:00:00.000Z',
//       answerer_name: 'String',
//       helpfulness: 45,
//       photos: [],
//       question_ref: q1._id
//     })

//     const a2 = await Answer.create({
//       asnwer_id: 114,
//       body: 'test-a-2',
//       date: '2022-08-21T00:00:00.000Z',
//       answerer_name: 'String-it',
//       helpfulness: 0,
//       photos: [],
//       question_ref: q2._id
//     })

//     await Question.find().populate({
//       'path': 'answers',
//       'match': { 'question_ref': q1._id }
//     })
//       .exec((err, question) => {
//         if (err) {
//           console.log('err in populate question')
//         }
//         console.log('results in quesiton 1', question)
//       })

//     await Question.findOne({ question_id: 12333 })
//       .populate('answers')
//       .exec((err, question) => {
//         if (err) {
//           console.log('err in populate question')
//         }
//         console.log('results in quesiton 2', question)
//       })

//     await QA.findOne({ product_ref: product._id })
//       .populate('results')
//       .exec((err, product) => {
//         if (err) {
//           console.log('err in populate qa')
//         }
//         console.log('results in product', product)
//       })

//   } catch (err) {
//     console.log('err somewhere in creation')
//   }
// }

// sampleData()

module.exports = { Question, Answer, QA }