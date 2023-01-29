const express = require('express')
const db = require('./SCHEMAS/mongodb.js')
const port = 3000

const app = express()
app.use(express.json())

// get questions
app.get('/qa/questions', async (req, res) => {
  try {
    let product_id = req.query.product_id
    let page = req.query.page || 1
    let count = req.query.count || 5
    let questions = await db.questions(product_id, count)

    if (questions.length === 0) {
      throw new Error('No matching product')
    } else if (!Array.isArray(questions)) {
      throw new Error(questions)
    }

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
    res.status(200).send(final)
  }
  catch (err) { res.status(500).end(err.message) }
})

// get answers
app.get('/qa/questions/:question_id/answers', async (req, res) => {
  try {
    let question_id = parseInt(req.params.question_id)
    let page = req.query.page || 1
    let count = req.query.page || 5

    if (question_id <= 0 || isNaN(question_id)) {
      throw new Error('Invalid question id provided')
    }

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
          answerer_name: answer.answerer_name,
          helpfulness: answer.answer_helpfulness,
          photos: answer.answer_photos
        }

        final.results.push(formatted)
        count--
      }
    })

    res.send(final)
  }
  catch (err) { res.status(500).end(err.message) }
})

// retrieve current id table
app.get('/qa/counts', async (req, res) => {
  try {
    let counts = await db.countQuery()
    res.send(counts)
  }
  catch (err) { return err.message }
})

// add a new question
app.post('/qa/questions', async (req, res) => {
  try {
    // confirm correct format
    let keys = Object.keys(req.body)
    if (keys.length === 0) {
      throw new Error('Please submit a valid question')
    } else if (!keys.includes('body') || !keys.includes('name') || !keys.includes('email') || !keys.includes('product_id')) {
      throw new Error('Invalid Question Post entry')
    }

    let body = req.body.body
    let name = req.body.name
    let email = req.body.email
    let product_id = req.body.product_id
    let counts = await db.countQuery()

    let data = {
      question_id: counts.questions + 1,
      product_id,
      question_body: body,
      question_date: new Date(),
      asker_name: name,
      asker_email: email,
      question_reported: false,
      question_helpfulness: 0,
      answers: []
    }

    // insert the question and update the count schema
    await db.insert(data)
    await db.incrementCount('questions', counts.questions + 1)
    res.status(201).send('Created')
  }
  catch (err) { res.status(500).end(err.message) }
})

// add a new answer
app.post('/qa/questions/:question_id/answers', async (req, res) => {
  try {
    // confirm correct format
    let keys = Object.keys(req.body)
    if (keys.length === 0) {
      throw new Error('Please submit a valid answer')
    } else if (!keys.includes('body') || !keys.includes('name') || !keys.includes('email') || !keys.includes('photos')) {
      throw new Error('Invalid Answer Post entry')
    }

    let question_id = req.params.question_id
    let body = req.body.body
    let name = req.body.name
    let email = req.body.email
    let photos = req.body.photos
    let counts = await db.countQuery()

    let data = {
      id: counts.answers + 1,
      body: body,
      date_written: new Date(),
      answerer_name: name,
      answerer_email: email,
      reported: false,
      helpful: 0,
      answer_photos: photos
    }

    // insert answer and increment the counter schema
    await db.answerInsert(question_id, data)
    await db.incrementCount('answers', counts.answers + 1)
    res.status(201).send('Created')
  }
  catch (err) { res.status(500).end(err.message) }
})

// update helpfulness of question
app.put('/qa/questions/:question_id/helpful', async (req, res) => {
  try {
    let question_id = req.params.question_id
    await db.helpfulQuestion(question_id)
    res.status(204).send()
  }
  catch (err) { res.status(500).end(err.message) }
})

// update helpfulness of answer
app.put('/qa/answers/:answer_id/helpful', async (req, res) => {
  try {
    let answer_id = req.params.answer_id
    await db.helpfulAnswer(answer_id)

    res.status(204).send()
  }
  catch (err) { res.status(500).end(err.message) }
})

// report a question
app.put('/qa/questions/:question_id/report', async (req, res) => {
  try {
    let question_id = parseInt(req.params.question_id)

    if (question_id <= 0 || isNaN(question_id)) {
      throw new Error('Invalid question id provided')
    }

    await db.reportedQuestion(question_id.toString())
    res.status(204).send()
  }
  catch (err) { res.status(500).end(err.message) }
})

// report an answer
app.put('/qa/answers/:answer_id/report', async (req, res) => {
  try {
    let answer_id = parseInt(req.params.answer_id)

    if (answer_id <= 0 || isNaN(answer_id)) {
      throw new Error('Invalid answer id provided')
    }
    await db.reportedAnswer(answer_id.toString())
    res.status(204).send()
  }
  catch (err) { res.status(500).end(err.message) }
})


const server = app.listen(port, () => {
  console.log(`QuestionsAnswersAPI listening on ${port}`)
})

module.exports = { server }