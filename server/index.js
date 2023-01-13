const express = require('express')
const db = require('./SCHEMAS/primarydb.js')
const port = 8080

const app = express()

app.get('/', (req, res) => {
  res.send('Hello world!')
})

app.listen(port, () => {
  console.log(`QuestionsAnswersAPI listening on ${port}`)
})