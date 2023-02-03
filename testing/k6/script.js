import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  vus: 1,
  duration: '60s',
  rps: 1,
  thresholds: {
    http_req_failed: ['rate<0.01'], // http errors should be less than 1%
    http_req_duration: ['p(90)<200'], // 90% of requests should be below 200ms
  },
  discardResponseBodies: true
}

export default function () {
  const URL = 'http://localhost:3030'
  const idOptions = [1000015, 1000014, 1000013, 1000012, 999996, 999997, 999998, 999999, 499990, 499991, 499993, 499994, 499995, 499996, 499997, 499998, 499999, 399994, 399995, 399996, 399997, 399998, 399999, 199996, 199997, 199998, 199999, 4993, 4996, 4997, 4998, 4999, 799995, 799996, 799997, 799998, 799999, 699991, 699992, 699993, 699994, 699996, 699997, 699998, 699999]
  let id = idOptions[Math.floor(Math.random() * idOptions.length)]

  // GET requests
  const resQ = http.get(`${URL}/qa/questions?product_id=${id}`)
  const resA = http.get(`${URL}/qa/questions/${id}/answers`)

  // PUT requests
  const resHQ = http.put(`${URL}/qa/questions/${id}/helpful`)
  const resHA = http.put(`${URL}/qa/answers/${id}/helpful`)
  const resRQ = http.put(`${URL}/qa/questions/${id}/report`)
  const resRA = http.put(`${URL}/qa/answers/${id}/report`)

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
  const resNewQ = http.post(`${URL}/qa/questions`, questionPost, params)
  const resNewA = http.post(`${URL}/qa/questions/${id}/answers`, answerPost, params)

  // check requests
  check(resQ, { 'is status 200': (r) => r.status === 200 })
  // check(resA, { 'is status 200': (r) => r.status === 200 })
  // check(resHQ, { 'is status 204': (r) => r.status === 204 })
  // check(resHA, { 'is status 204': (r) => r.status === 204 })
  // check(resRQ, { 'is status 204': (r) => r.status === 204 })
  // check(resRA, { 'is status 204': (r) => r.status === 204 })
  // check(resNewQ, { 'is status 201': (r) => r.status === 201 })
  // check(resNewA, { 'is status 201': (r) => r.status === 201 })


  // wait 1 second between requests
  sleep(1)
}