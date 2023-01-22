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

// get all questions
let questions = async (product_id) => {
  return await QandA.find({ product_id }).exec()
}

// insert a new document as a question
let insert = async (data) => {
  await QandA.create(data).catch((err) => console.log('err in insert', err.message))
}

// insert an answer into the provided question document
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
    await QandA.findByIdAndUpdate(id, { answers })
  }
}

// add an image to a given answer
let answerPhotoInsert = async (data) => {
  let url = data.url

  // query the db for the answer and needed info
  let question = await QandA.findOne({
    'answers': {
      $elemMatch: {
        'answer_id': data.answer_id
      }
    }
  })

  let id = question._id
  let answers = question.answers
  let newAnswer, photosArr

  answers.forEach((answer, index) => {
    if (parseInt(data.answer_id) === answer.answer_id) {
      newAnswer = answer
      photosArr = answer.answer_photos
      answers.splice(index, 1)
    }
  })

  // if not present, insert the answer to the array from the question
  let isPresent = false
  photosArr.forEach(photoUrl => {
    if (!isPresent) {
      if (photoUrl === url) {
        isPresent = true
      }
    }
  })

  if (!isPresent) {
    // add the image url to the answer photos array
    photosArr.push(url)
    newAnswer.answer_photos = photosArr

    // add the updated answer to the answers array
    answers.push(newAnswer)

    // update the answers for the question
    question.answers = answers

    await QandA.findByIdAndUpdate(id, question)
  }
}

// increment a helpful question
let helpfulQuestion = async (question_id) => {
  // query the db for the question and needed info
  let query = { question_id }
  let question = await QandA.find(query)
  let id = question[0]._id


  await QandA.findByIdAndUpdate()
}

// increment a helpful answer
let helpfulAnswer = async (answer_id) => {

}

// report a question
let reportedQuestion = async (question_id) => {

}

// report an answer
let reportedAnswer = async (answer_id) => {

}

// Compile model from schema
const QandA = mongoose.model("QandAs", QandASchema)
const Answer = mongoose.model("Answers", AnswerSchema)


module.exports = {
  QandA,
  Answer,
  insert,
  answerInsert,
  answerPhotoInsert,
  helpfulQuestion,
  helpfulAnswer,
  reportedQuestion,
  reportedAnswer
}