const express = require('express')
const db = require('./SCHEMAS/mongodb.js')
let bodyParser = require('body-parser')
const port = 3050

const app = express()

// get questions
app.get('/qa/questions', async (req, res) => {
  try {
    let product_id = req.query.product_id
    let page = req.query.page || 1
    let count = req.query.count || 5
    let questions = await db.questions(product_id, count)

    let final = {
      product_id,
      results: []
    }

    questions.forEach(question => {
      let formatted = {
        question_id: question.question_id,
        question_body: question.question_body,
        question_date: question.question_date,
        asker_name: question.asker_name,
        question_helpfulness: question.question_helpfulness,
        reported: question.question_reported,
        answers: {}
      }

      question.answers.forEach(answer => {
        if (!answer.answer_reported) {
          formatted.answers[answer.answer_id] = {}
          formatted.answers[answer.answer_id].id = answer.answer_id
          formatted.answers[answer.answer_id].body = answer.answer_body
          formatted.answers[answer.answer_id].answerer_name = answer.answerer_name
          formatted.answers[answer.answer_id].helpfulness = answer.answer_helpfulness
          formatted.answers[answer.answer_id].photos = answer.answer_photos
        }
      })
      final.results.push(formatted)
    })
    res.send(final)
  }
  catch (err) {
    console.log('err in get questions', err.message)
  }
})

// get answers
app.get('/qa/questions/:question_id/answers', async (req, res) => {
  try {
    let question_id = req.params.question_id
    let page = req.query.page || 1
    let count = req.query.page || 5

    let result = await db.answers(question_id)

    let final = {
      question: result.question_id.toString(),
      page,
      count,
      results: []
    }

    result.answers.forEach(answer => {
      if (!answer.answer_reported && count > 0) {
        let formatted = {
          answer_id: answer.answer_id,
          body: answer.answer_body,
          date: answer.answer_date,
          aswerer_name: answer.answerer_name,
          helpfulness: answer.answer_helpfulness,
          photos: answer.answer_photos
        }

        final.results.push(formatted)
        count--
      }
    })

    res.send(final)
  }
  catch (err) {
    console.log('err in get answers', err.message)
  }
})

// add a new question
app.post('/qa/questions', async (req, res) => {
  try {
    let body = req.body.body
    let name = req.body.name
    let email = req.body.email
    let product_id = req.body.product_id
    let count = await db.count()

    let data = {
      question_id: count,
      product_id,
      question_body: body,
      question_date: new Date(),
      asker_name: name,
      asker_email: email,
      question_reported: false,
      question_helpfulness: 0,
      answers: []
    }

    await db.insert(data)

    res.sendStatus(204).send('Created')
  }
  catch (err) {
    console.log('err in posting a question', err.message)
  }
})

// add a new answer
app.post('/qa/questions/:question_id/answers', (req, res) => {
  try {
    let question_id = req.params.question_id
    let body = req.body.body
    let name = req.body.name
    let email = req.body.email
    let photos = req.body.photos

    let data = {
      answer_id: 'need count',
      answer_body: body,
      answer_date: new Date(),
      answerer_name: name,
      answerer_email: email,
      answer_reported: false,
      answer_helpfulness: 0,
      answer_photos: photos
    }

    res.sendStatus(204).send('Created')
  }
  catch (err) {
    console.log('err in posting an answer', err.message)
  }
})

// update helpfulness of question
app.put('/qa/questions/:question_id/helpful', async (req, res) => {
  try {
    let question_id = req.params.question_id
    await db.helpfulQuestion(question_id)

    res.status(204).send('Created')
  }
  catch (err) {
    console.log('err in helpful question', err.message)
  }
})

// update helpfulness of answer
app.put('/qa/questions/:answer_id/helpful', async (req, res) => {
  try {

    res.sendStatus(204).send('Created')
  }
  catch (err) {
    console.log('err in helpful answer', err.message)
  }
})

// report a question
app.put('/qa/questions/:question_id/report', async (req, res) => {
  try {

    res.sendStatus(204).send('Created')
  }
  catch (err) {
    console.log('err in reported question', err.message)
  }
})

// report an answer
app.put('/qa/questions/:answer_id/report', async (req, res) => {
  try {

    res.sendStatus(204).send('Created')
  }
  catch (err) {
    console.log('err in reported answer', err.message)
  }
})


app.listen(port, () => {
  console.log(`QuestionsAnswersAPI listening on ${port}`)
})