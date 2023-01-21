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
  await csv().fromFile(questionSample)
    .subscribe((json, lineNum) => {
      return new Promise((resolve, reject) => {
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

// next add the answer data
let readWriteAnswers = async () => {
  await csv().fromFile(answerSample)
    .subscribe((json, lineNum) => {
      return new Promise((resolve, reject) => {
        let question_id = json.question_id
        resolve(db.answerInsert(question_id, json))
      })
    })
}

// finally, add the photo urls for the answers
let readWriteAnswerPhotos = async () => {
  console.log('photos')
  await csv().fromFile(answerPhotoSample)
    .subscribe((json, lineNum) => {
      return new Promise((resolve, reject) => {
        let answer_id = json.answer_id
        let url = json.url
        resolve(db.answerPhotoInsert(answer_id, url))
      })
    })
}


// initial load of data
let initialLoad = async () => { await readWriteQuestions() }
let secondLoad = async () => { await readWriteAnswers() }
let thirdLoad = async () => { await readWriteAnswerPhotos() }

// initialLoad()
secondLoad()
// thirdLoad()