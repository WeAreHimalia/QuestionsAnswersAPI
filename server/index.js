const express = require('express')
const db = require('./SCHEMAS/mongodb.js')
const port = 3000

const app = express()

// get questions
app.get('/qa/questions', async (req, res) => {
  let product_id = req.body.product_id
  let questions = await db.questions(product_id)
  res.send(product_id)
})

app.listen(port, () => {
  console.log(`QuestionsAnswersAPI listening on ${port}`)
})