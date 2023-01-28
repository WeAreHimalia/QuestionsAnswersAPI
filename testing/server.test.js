const server = require('../server/index.js').server
const mongoose = require('mongoose')
const request = require('supertest')

beforeAll(done => {
  done()
})

afterAll(done => {
  server.close()
  mongoose.connection.close();
  done()
})

/********** GET REQUESTS **********/

describe('GET Questions for a single product', () => {
  it('should return the correct statusCode for a valid request', async () => {
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

  it('should return the correct statusCode and error message for a non-existing product', async () => {
    const get = await request(server).get('/qa/questions?product_id=0')
    expect(get.statusCode).toBe(500)
    expect(get.text).toBe('No matching product')
  })

  it('should return the correct statusCode and error message for an incorrect string input', async () => {
    const stringId = 'abc'
    const err = `CastError: Cast to Number failed for value "${stringId}" (type string) at path "product_id" for model "QandAs"`
    const get = await request(server).get(`/qa/questions?product_id=${stringId}`)
    expect(get.statusCode).toBe(500)
    expect(get.text).toBe(err)
  })
})

describe('GET Answers for a single question', () => {
  it('should return the correct statusCode for a valid request', async () => {
    const get = await request(server).get('/qa/questions/1/answers')
    expect(get.statusCode).toBe(200)
  })

  it('should have the correct format', async () => {
    const get = await request(server).get('/qa/questions/4/answers')
    let body = get.body.results

    expect(body[0]).toHaveProperty('answer_id')
    expect(body[0]).toHaveProperty('body')
    expect(body[0]).toHaveProperty('date')
    expect(body[0]).toHaveProperty('answerer_name')
    expect(body[0]).toHaveProperty('helpfulness')
    expect(body[0]).toHaveProperty('photos')
  })

  it('should contain the proper data', async () =>{
    const get = await request(server).get('/qa/questions/44/answers')
    let body = get.body

    expect(body.question).toEqual('44')
    expect(body.results).toHaveLength(4)

    let included = false, sample = 66
    body.results.forEach(answer => {
      if (answer.answer_id === sample) {
        included = true
      }
    })

    expect(included).toBe(true)
  })

  it('should return the correct statusCode and error message for a non-existing product', async () => {
    const get = await request(server).get('/qa/questions/0/answers')
    expect(get.statusCode).toBe(500)
    expect(get.text).toBe('Invalid question id provided')
  })

  it('should return the correct statusCode and error message for an incorrect string input', async () => {
    const get = await request(server).get(`/qa/questions/abc/answers`)
    expect(get.statusCode).toBe(500)
    expect(get.text).toBe('Invalid question id provided')
  })
})

/********** PUT REQUESTS **********/

/********** POST REQUESTS **********/
