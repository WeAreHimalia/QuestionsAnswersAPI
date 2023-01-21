const mongoose = require("mongoose")
const mongoDB = "mongodb://127.0.0.1/qa"

mongoose.set('strictQuery', true)
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection
db.on("error", console.error.bind(console, "MongoDB connection error:"))

// Define schemas
const Schema = mongoose.Schema

const AnswerSchema = new Schema({
  answer_id: {
    type: Number,
    index: true,
    unique: true,
    sparse: true
  },
  answer_body: String,
  answer_date: Date,
  answerer_name: String,
  answerer_email: String,
  answer_reported: Boolean,
  answer_helpfulness: Number,
  answer_photos: [String]
})

const QandASchema = new Schema({
  question_id: {
    type: Number,
    index: true,
    unique: true
  },
  product_id: Number,
  question_body: String,
  question_date: Date,
  asker_name: String,
  asker_email: String,
  question_reported: Boolean,
  question_helpfulness: Number,
  answers: [AnswerSchema]
})

let insert = async (data) => {
  await QandA.create(data)
    .then(() => console.log('saved insert'))
    .catch((err) => console.log('err in insert', err.message))
}

let answerInsert = async (question_id, data) => {
  // query the db for the question and needed info
  let query = { question_id }
  let question = await QandA.find(query)
  let id = question[0]._id
  let answers = question[0].answers

  // setup the new answer data
  let answer = new Answer({
    answer_id: data.id,
    answer_body: data.body,
    answer_date: data.date_written,
    answerer_name: data.answerer_name,
    answerer_email: data.answerer_email,
    answer_reported: data.reported,
    answer_helpfulness: data.helpful,
    answer_photos: []
  })

  // if not present, insert the answer to the array from the question
  let isPresent = false
  answers.forEach(answer => {
    if (!isPresent) {
      if (answer.answer_id === parseInt(data.id)) {
        isPresent = true
      }
    }
  })

  if (!isPresent) {
    answers.push(answer)
    // add the answer to the asnwers array for this question
    let complete = await QandA.findByIdAndUpdate(id, { answers }, { returnDocument: 'after' })
    console.log(complete)
  }
}

let answerPhotoInsert = async (answerId, url) => {
  // query the db for the answer and needed info
  console.log(answer_id, url)
  let query = { answer_id }
  // let answer = await QandA.find(query)
  // let id = answer[0]._id
  // let photosArr = answer[0].answer_photos

  console.log('sample', query, url)

  // add the image url to the answer photos array for this answer

  // if not present, insert the answer to the array from the question
  // let isPresent = false
  // answers.forEach(answer => {
  //   if (!isPresent) {
  //     if (answer.answer_id === parseInt(data.id)) {
  //       isPresent = true
  //     }
  //   }
  // })

  // if (!isPresent) {
  //   answers.push(answer)
  //   // add the answer to the asnwers array for this question
  //   let complete = await QandA.findByIdAndUpdate(id, { answers }, { returnDocument: 'after' })
  //   console.log(complete)
  // }
}

// Compile model from schema
const QandA = mongoose.model("QandAs", QandASchema)
const Answer = mongoose.model("Answers", AnswerSchema)


module.exports = { QandA, Answer, insert, answerInsert, answerPhotoInsert }