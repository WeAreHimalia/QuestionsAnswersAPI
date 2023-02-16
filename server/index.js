const express = require('express')
const db = require('./SCHEMAS/mongodb.js')
const morgan = require('morgan')
const port = 3030

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(morgan('dev', {
  skip: function (req, res) { return res.statusCode < 400 }
}))

// loader.io verification
app.get('/loaderio-b1607a940523af4d24cd1e6a0ca41fc0.txt', (req, res) => {
  res.status(200).send(Verified)
})

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
  catch (err) {
    console.log('get questions', err.message)
    res.status(500).end(err.message)
  }
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

    let result = await db.answers(question_id, count)

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
  catch (err) {
    console.log('get answers', err.message)
    res.status(500).end(err.message)
  }
})

// retrieve current id table for jest tests
app.get('/qa/counts', async (req, res) => {
  try {
    let counts = await db.countQuery()
    res.send(counts)
  }
  catch (err) { res.status(500).end(err.message) }
})

// add a new question
app.post('/qa/questions', async (req, res) => {
  try {
    // confirm correct format
    let body = req.body
    let keys = Object.keys(body)
    if (keys.length === 0) {
      throw new Error('Please submit a valid question')
    } else if (!keys.includes('body') || !keys.includes('name') || !keys.includes('email') || !keys.includes('product_id')) {
      throw new Error('Invalid Question Post entry')
    }

    let data = {
      product_id: body.product_id,
      question_body: body.body,
      question_date: new Date(),
      asker_name: body.name,
      asker_email: body.email,
      question_reported: false,
      question_helpfulness: 0,
      answers: []
    }

    // insert the question and update the count schema
    await db.insert(data)
    res.status(201).send('Created')
  }
  catch (err) {
    console.log('post questions', err.message)
    res.status(500).end(err.message)
  }
})

// add a new answer
app.post('/qa/questions/:question_id/answers', async (req, res) => {
  try {
    // confirm correct format
    let question_id = req.params.question_id
    let body = req.body
    let keys = Object.keys(body)
    if (keys.length === 0) {
      throw new Error('Please submit a valid answer')
    } else if (!keys.includes('body') || !keys.includes('name') || !keys.includes('email') || !keys.includes('photos')) {
      throw new Error('Invalid Answer Post entry')
    }

    let data = {
      body: body.body,
      date_written: new Date(),
      answerer_name: body.name,
      answerer_email: body.email,
      reported: false,
      helpful: 0,
      answer_photos: body.photos
    }

    // insert answer and increment the counter schema
    await db.answerInsert(question_id, data)
    res.status(201).send('Created')
  }
  catch (err) {
    console.log('post answers', err.message)
    res.status(500).end(err.message)
  }
})

// update helpfulness of question
app.put('/qa/questions/:question_id/helpful', async (req, res) => {
  try {
    let question_id = req.params.question_id
    await db.helpfulQuestion(question_id)
    res.status(204).send()
  }
  catch (err) {
    console.log('helpful questions', err.message)
    res.status(500).end(err.message)
  }
})

// update helpfulness of answer
app.put('/qa/answers/:answer_id/helpful', async (req, res) => {
  try {
    let answer_id = req.params.answer_id
    await db.helpfulAnswer(answer_id)
    res.status(204).send()
  }
  catch (err) {
    console.log('helpful answers', err.message)
    res.status(500).end(err.message)
  }
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
  catch (err) {
    console.log('report questions', err.message)
    res.status(500).end(err.message)
  }
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
  catch (err) {
    console.log('report answers', err.message)
    res.status(500).end(err.message)
  }
})


const server = app.listen(port, () => { console.log(`QuestionsAnswersAPI listening on ${port}`) })

module.exports = { server }