import http from 'k6/http'
import { sleep } from 'k6'

export const options = {
  vus: 10,
  duration: '60s',

  // stages: [
  //   { duration: '30s', target: 20 },
  //   { duration: '1m30s', target: 10 },
  //   { duration: '20s', target: 0 },
  // ],
}

export default function () {
  const URL = 'http://localhost:3030'
  let id = 2500000

  // GET requests
  http.get(`${URL}/qa/questions?product_id=${id}`)
  http.get(`${URL}/qa/questions/${id}/answers`)

  // PUT requests
  http.put(`${URL}/qa/questions/${id}/helpful`)
  http.put(`${URL}/qa/answers/${id}/helpful`)
  http.put(`${URL}/qa/questions/${id}/report`)
  http.put(`${URL}/qa/answers/${id}/report`)

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

  // POST requests
  http.post(`${URL}/qa/questions`, questionPost, params)
  http.post(`${URL}/qa/questions/${id}/answers`, answerPost, params)

  // decrement the id
  id--

  // wait 1 second between requests
  sleep(1)
}