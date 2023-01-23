const express = require('express')
const db = require('./SCHEMAS/mongodb.js')
const port = 3050

const app = express()

// get questions
app.get('/qa/questions', async (req, res) => {
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
})

// get answers
app.get('/qa/questions/:question_id/answers', async (req, res) => {
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
})

// update helpfulness of question
app.put('qa/questions/:question_id/helpful', async (req, res) => {

})

// update helpfulness of answer
app.put('qa/questions/:answer_id/helpful', async (req, res) => {

})

// report a question

// report an answer


app.listen(port, () => {
  console.log(`QuestionsAnswersAPI listening on ${port}`)
})