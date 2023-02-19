const csv = require('csvtojson')
const db = require('./SCHEMAS/mongodb.js')

// sample data
const questionSample = '/Users/mindiweik/Desktop/SDC/QuestionsAnswersAPI/data/sample/questions_sample.csv'
const answerSample = '/Users/mindiweik/Desktop/SDC/QuestionsAnswersAPI/data/sample/answers_sample.csv'
const answerPhotoSample = '/Users/mindiweik/Desktop/SDC/QuestionsAnswersAPI/data/sample/answers_photos_sample.csv'

// final data
const questionData = '/Users/mindiweik/Desktop/SDC/QuestionsAnswersAPI/data/final/questions.csv'
const answerData = '/Users/mindiweik/Desktop/SDC/QuestionsAnswersAPI/data/final/answers.csv'
const answerPhotoData = '/Users/mindiweik/Desktop/SDC/QuestionsAnswersAPI/data/final/answers_photos.csv'


// start with insertion of question data
let readWriteQuestions = async () => {
  console.log('start questions import')
  let count = -1
  try {
    await csv().fromFile(questionData)
      .subscribe((json, lineNum) => {
        return new Promise((resolve, reject) => {

          count++
          if (count % 10000 === 0) {
            console.log('line number in questions', count)
          }

          resolve(db.insert({
            question_id: json.id,
            product_id: json.product_id,
            question_body: json.body,
            question_date: json.date_written,
            asker_name: json.asker_name,
            asker_email: json.asker_email,
            question_reported: json.reported,
            question_helpfulness: json.helpful,
            answers: []
          }))
        })
      })
  }
  catch (err) { return err.message }
}

// next add the answer data
let readWriteAnswers = async () => {
  console.log('start answers import')
  let count = -1
  try {
    await csv().fromFile(answerData)
      .subscribe((json, lineNum) => {
        return new Promise((resolve, reject) => {

          count++
          if (count % 10000 === 0) {
            console.log('line number in import answers', count)
          }

          let question_id = json.question_id
          resolve(db.answerInsert(question_id, json))
        })
      })
  }
  catch (err) { return err.message }
}

// finally, add the photo urls for the answers
let readWriteAnswerPhotos = async () => {
  console.log('start answer photos import')
  let count = -1
  try {
    await csv().fromFile(answerPhotoData)
      .subscribe((json, lineNum) => {
        return new Promise((resolve, reject) => {

          count++
          if (count % 10000 === 0) {
            console.log('line number in import answer photos', count)
          }

          resolve(db.answerPhotoInsert(json))
        })
      })
  }
  catch (err) { return err.message }
}


// initial load of data
let loadAllThree = async () => {
  await readWriteQuestions()
  await readWriteAnswers()
  await readWriteAnswerPhotos()

  console.log('start update counts')
  await db.updateCounts()
}

loadAllThree()