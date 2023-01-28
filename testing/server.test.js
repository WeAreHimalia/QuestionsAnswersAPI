const server = require('../server/index.js').server;
const request = require('supertest');


beforeAll(() => {
})

afterAll(done => {
  server.close()
  done()
})

/********** POST REQUESTS **********/


/********** GET REQUESTS **********/

describe('GET Questions for a single product', () => {
  it('should return the correct statusCode', async () => {
    const get = await request(server).get('/qa/questions?product_id=1')
    expect(get.statusCode).toBe(200)
  })

  it('should have the correct format', async () => {
    const get = await request(server).get('/qa/questions?product_id=1')
    let body = get.body

    expect(body.results[0]).toHaveProperty('question_id')
    expect(body.results[0]).toHaveProperty('question_body')
    expect(body.results[0]).toHaveProperty('question_date')
    expect(body.results[0]).toHaveProperty('asker_name')
    expect(body.results[0]).toHaveProperty('question_helpfulness')
    expect(body.results[0]).toHaveProperty('reported')
    expect(body.results[0]).toHaveProperty('answers')
  })

  it('should contain the proper data', async () =>{
    const get = await request(server).get('/qa/questions?product_id=4')
    let body = get.body

    expect(body.product_id).toEqual('4')
    expect(body.results).toHaveLength(3)

    let included = false, sample = 32
    body.results.forEach(question => {
      if (question.question_id === sample) {
        included = true
      }
    })

    expect(included).toBe(true)
  })
})

describe('GET Answers for a single question', () => {
  it('should return the correct statusCode', async () => {
    const res = await request(server).get('/qa/questions/1/answers')
    expect(res.statusCode).toBe(200)
  })

  it('should contain the proper data', async () =>{
    const res = await request(server).get('/qa/questions/1/answers')

  })
})

/********** PUT REQUESTS **********/