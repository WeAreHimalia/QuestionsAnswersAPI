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
  http.get('http://localhost:3030/qa/questions/75/helpful')

  // wait 1 second between requests
  sleep(1)

}