import http from 'k6/http'
import { sleep } from 'k6'

export const options = {
  vus: 10,
  duration: '60s',
}

export default function () {
  // GET requests
  http.get('http://localhost:3030/qa/questions?product_id=10001')
  http.get('http://localhost:3030/qa/questions/88/answers')

  // PUT requests
  http.put('http://localhost:3030/qa/questions/75/helpful')
  http.put('http://localhost:3030/qa/answers/148/helpful')
  http.put('http://localhost:3030/qa/questions/45/report')
  http.put('http://localhost:3030/qa/answers/100/report')

  // POST requests
  const questionPost = JSON.stringify({
    product_id: '55',
    body: 'K6 test body',
    name: 'I test K6',
    email: 'k6@test.com'
  })

  const answerPost = JSON.stringify({
    body: 'K6 test answer body',
    name: 'I test K6',
    email: 'k6@test.com',
    photos: []
  })

  const params = {
    headers: {
      'Content-Type': 'application/json',
    }
  }

  http.post('http://localhost:3030/qa/questions', questionPost, params)
  http.post('http://localhost:3030/qa/questions/41/answers', answerPost, params)

  // wait 1 second between requests
  sleep(1)

}