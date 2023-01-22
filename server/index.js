const express = require('express')
const db = require('./SCHEMAS/mongodb.js')
const port = 3050

const app = express()

// get questions
app.get('/qa/questions', async (req, res) => {
  let product_id = req.query.product_id
  let questions = await db.questions(product_id)
  console.log(questions)

  let final = {
    product_id,
    results: []
  }

  questions.forEach(question => {
    if (!question.question_reported) {
      let formatted = {
        question_id: question.question_id,
        question_body: question.question_body,
        question_date: question.question_date,
        asker_name: question.asker_name,
        question_helpfulness: question.question_helpfulness,
        reported: question.question_reported,
        answers: {}
      }

      let unreportedAnswers = {}

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
    }
  })
  res.send(final)
})

app.listen(port, () => {
  console.log(`QuestionsAnswersAPI listening on ${port}`)
})