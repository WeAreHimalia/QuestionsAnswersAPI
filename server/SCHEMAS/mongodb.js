const mongoose = require("mongoose")
require('dotenv').config()
const SECRET = process.env.MONGO_SECRET
const mongoDB = `mongodb://mindi:${SECRET}@localhost/qa`

mongoose.set('strictQuery', true)
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection
db.on("error", console.error.bind(console, "MongoDB connection error:"))

// Define schemas
const Schema = mongoose.Schema

const CountSchema = new Schema({
  questions: Number,
  answers: Number
})

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

// Compile model from schema
const QandA = mongoose.model("QandAs", QandASchema)
const Answer = mongoose.model("Answers", AnswerSchema)
const Count = mongoose.model("Counts", CountSchema)

// get all questions
let questions = async (product_id, count) => {
  try { return await QandA.find({ product_id, question_reported: false }).limit(count).select('product_id question_id question_body question_date asker_name question_helpfulness question_reported answers').lean() }
  catch (err) { return err }
}

// get all answers for a question
let answers = async (question_id, count) => {
  try { return await QandA.findOne({ question_id }).lean() }
  catch (err) { return err }
}

// identify the next question id
let countQuestions = async () => {
  try { return await QandA.count().lean() }
  catch (err) { return err }
}

// identify the next answer id
let countAnswers = async () => {
  try {
    let count = await QandA.aggregate([
      { $unwind: { path: "$answers" } },
      { $group: { _id: null, answers: { $count: {} } } },
      { $project: { _id: 0, answers: 1 } }
    ])
    return count[0].answers
  }
  catch (err) { return err }
}

// return the id counts from the database
let countQuery = async () => {
  try { return await Count.findOne() }
  catch (err) { return err }
}

// udpdate the counts database
let updateCounts = async () => {
  try {
    let questions = await countQuestions()
    let answers = await countAnswers()
    let data = { questions, answers }
    let checkCounts = await Count.findOne()

    if (checkCounts === null) {
      await Count.create(data).lean()
    } else {
      let id = checkCounts._id
      await Count.findByIdAndUpdate(id, { questions: data.questions }).lean()
      await Count.findByIdAndUpdate(id, { answers: data.answers }).lean()
    }
  }
  catch (err) { return err }
}

// increment the id counts for the database
let incrementCount = async (countName, num) => {
  try {
    let count = await Count.findOne()

    if (count === null) {
      await updateCounts()
      count = await Count.findOne()
    }

    let id = count._id
    let update = {}
    update[countName] = num

    await Count.findByIdAndUpdate(id, update).lean()
  }
  catch (err) { return err }
}

// insert a new document as a question
let insert = async (data) => {
  try {
    let num
    if (!data.question_id) {
      let count = await Count.findOne()
      num = parseInt(count.questions)
      data.question_id = num + 1
    }
    await QandA.create(data)
    incrementCount('questions', num + 1)
  }
  catch (err) { return err }
}

// insert an answer into the provided question document
let answerInsert = async (question_id, data) => {
  try {
    let query = { question_id }
    let question = await QandA.findOne(query).lean()
    let id = question._id
    let answers = question.answers
    let answer_id

    if (!data.id) {
      let count = await Count.findOne()
      let num = parseInt(count.answers)
      answer_id = num + 1
    } else {
      answer_id = data.id
    }

    let answer = new Answer({
      answer_id: answer_id,
      answer_body: data.body,
      answer_date: data.date_written,
      answerer_name: data.answerer_name,
      answerer_email: data.answerer_email,
      answer_reported: data.reported,
      answer_helpfulness: data.helpful,
      answer_photos: data.photos || []
    })

    await QandA.findByIdAndUpdate(id, { $addToSet: { answers } }).lean()
    incrementCount('answers', answer_id)
  }
  catch (err) { return err }
}

// add an image to a given answer
let answerPhotoInsert = async (data) => {
  try {
    let url = data.url
    let question = await QandA.findOne({
      'answers': {
        $elemMatch: {
          'answer_id': data.answer_id
        }
      }
    }).lean()

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

    let isPresent = false
    photosArr.forEach(photoUrl => {
      if (!isPresent) {
        if (photoUrl === url) {
          isPresent = true
        }
      }
    })

    if (!isPresent) {
      photosArr.push(url)
      newAnswer.answer_photos = photosArr
      answers.push(newAnswer)
      question.answers = answers

      await QandA.findByIdAndUpdate(id, question).lean()
    }
  }
  catch (err) { return err }
}

// increment a helpful question
let helpfulQuestion = async (question_id) => {
  try {
    let query = { question_id }
    let question = await QandA.findOne(query).lean()
    let id = question._id
    let question_helpfulness = question.question_helpfulness + 1

    await QandA.findByIdAndUpdate(id, { question_helpfulness })
  }
  catch (err) { return err }
}

// increment a helpful answer
let helpfulAnswer = async (answer_id) => {
  try {
    // query the db for the question and needed info
    let question = await QandA.findOne({
      'answers': { $elemMatch: { 'answer_id': answer_id } }
    }).lean()
    let id = question._id
    let answers = question.answers

    answers.forEach((answer, index) => {
      if (parseInt(answer_id) === answer.answer_id) {
        answer.answer_helpfulness++
      }
    })

    await QandA.findByIdAndUpdate(id, { answers }).lean()
  }
  catch (err) { return err }
}

// report a question
let reportedQuestion = async (question_id) => {
  try {
    // query the db for the question and needed info
    let query = { question_id }
    let question = await QandA.findOne(query).lean()
    let id = question._id
    let question_reported = !question.question_reported
    // console.log('inner test', question.question_reported, question_reported)

    await QandA.findByIdAndUpdate(id, { question_reported }).lean()
  }
  catch (err) { return err }
}

// report an answer
let reportedAnswer = async (answer_id) => {
  try {
    // query the db for the question and needed info
    let question = await QandA.findOne({
      'answers': {
        $elemMatch: {
          'answer_id': answer_id
        }
      }
    }).lean()
    let id = question._id
    let answers = question.answers

    answers.forEach((answer, index) => {
      if (parseInt(answer_id) === answer.answer_id) {
        answer.answer_reported = !answer.answer_reported
      }
    })

    await QandA.findByIdAndUpdate(id, { answers }).lean()
  }
  catch (err) { return err }
}

module.exports = {
  QandA,
  Answer,
  Count,
  countQuestions,
  countAnswers,
  countQuery,
  updateCounts,
  incrementCount,
  questions,
  answers,
  insert,
  answerInsert,
  answerPhotoInsert,
  helpfulQuestion,
  helpfulAnswer,
  reportedQuestion,
  reportedAnswer
}