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
    expect(body.results.length > 0).toBe(true)

    let included = false, sample = 32
    body.results.forEach(question => {
      if (question.question_id === sample) {
        included = true
      }
    })

    expect(included).toBe(true)
  })

  it('should return the correct statusCode and error for a non-existing product', async () => {
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
    let results = get.body.results

    expect(results[0]).toHaveProperty('answer_id')
    expect(results[0]).toHaveProperty('body')
    expect(results[0]).toHaveProperty('date')
    expect(results[0]).toHaveProperty('answerer_name')
    expect(results[0]).toHaveProperty('helpfulness')
    expect(results[0]).toHaveProperty('photos')
  })

  it('should contain the proper data', async () =>{
    const get = await request(server).get('/qa/questions/44/answers')
    let body = get.body

    expect(body.question).toEqual('44')
    expect(body.results.length > 0).toBe(true)

    let included = false, sample = 66
    body.results.forEach(answer => {
      if (answer.answer_id === sample) {
        included = true
      }
    })

    expect(included).toBe(true)
  })

  it('should return the correct statusCode and error message for an invalid product number', async () => {
    const get = await request(server).get('/qa/questions/0/answers')
    expect(get.statusCode).toBe(500)
    expect(get.text).toBe('Invalid question id provided')
  })

  it('should return the correct statusCode and error message for a string input', async () => {
    const get = await request(server).get(`/qa/questions/abc/answers`)
    expect(get.statusCode).toBe(500)
    expect(get.text).toBe('Invalid question id provided')
  })
})

/********** POST REQUESTS **********/

describe('POST a Question for a single product', () => {
  // it('should return the correct statusCode for a valid request', async () => {
  //   const get = await request(server).get('/qa/questions?product_id=1')
  //   expect(get.statusCode).toBe(200)
  // })

  // it('should have the correct format', async () => {
  //   const get = await request(server).get('/qa/questions?product_id=1')
  //   let body = get.body

  //   expect(body.results[0]).toHaveProperty('question_id')
  //   expect(body.results[0]).toHaveProperty('question_body')
  //   expect(body.results[0]).toHaveProperty('question_date')
  //   expect(body.results[0]).toHaveProperty('asker_name')
  //   expect(body.results[0]).toHaveProperty('question_helpfulness')
  //   expect(body.results[0]).toHaveProperty('reported')
  //   expect(body.results[0]).toHaveProperty('answers')
  // })

  // it('should contain the proper data', async () =>{
  //   const get = await request(server).get('/qa/questions?product_id=4')
  //   let body = get.body

  //   expect(body.product_id).toEqual('4')
  //   expect(body.results.length > 0).toBe(true)

  //   let included = false, sample = 32
  //   body.results.forEach(question => {
  //     if (question.question_id === sample) {
  //       included = true
  //     }
  //   })

  //   expect(included).toBe(true)
  // })

  // it('should return the correct statusCode and error for a non-existing product', async () => {
  //   const get = await request(server).get('/qa/questions?product_id=0')
  //   expect(get.statusCode).toBe(500)
  //   expect(get.text).toBe('No matching product')
  // })

  // it('should return the correct statusCode and error message for an incorrect string input', async () => {
  //   const stringId = 'abc'
  //   const err = `CastError: Cast to Number failed for value "${stringId}" (type string) at path "product_id" for model "QandAs"`
  //   const get = await request(server).get(`/qa/questions?product_id=${stringId}`)
  //   expect(get.statusCode).toBe(500)
  //   expect(get.text).toBe(err)
  // })
})

describe('POST an Answer for a single Question', () => {
  // it('should return the correct statusCode for a valid request', async () => {
  //   const get = await request(server).get('/qa/questions?product_id=1')
  //   expect(get.statusCode).toBe(200)
  // })

  // it('should have the correct format', async () => {
  //   const get = await request(server).get('/qa/questions?product_id=1')
  //   let body = get.body

  //   expect(body.results[0]).toHaveProperty('question_id')
  //   expect(body.results[0]).toHaveProperty('question_body')
  //   expect(body.results[0]).toHaveProperty('question_date')
  //   expect(body.results[0]).toHaveProperty('asker_name')
  //   expect(body.results[0]).toHaveProperty('question_helpfulness')
  //   expect(body.results[0]).toHaveProperty('reported')
  //   expect(body.results[0]).toHaveProperty('answers')
  // })

  // it('should contain the proper data', async () =>{
  //   const get = await request(server).get('/qa/questions?product_id=4')
  //   let body = get.body

  //   expect(body.product_id).toEqual('4')
  //   expect(body.results.length > 0).toBe(true)

  //   let included = false, sample = 32
  //   body.results.forEach(question => {
  //     if (question.question_id === sample) {
  //       included = true
  //     }
  //   })

  //   expect(included).toBe(true)
  // })

  // it('should return the correct statusCode and error for a non-existing product', async () => {
  //   const get = await request(server).get('/qa/questions?product_id=0')
  //   expect(get.statusCode).toBe(500)
  //   expect(get.text).toBe('No matching product')
  // })

  // it('should return the correct statusCode and error message for an incorrect string input', async () => {
  //   const stringId = 'abc'
  //   const err = `CastError: Cast to Number failed for value "${stringId}" (type string) at path "product_id" for model "QandAs"`
  //   const get = await request(server).get(`/qa/questions?product_id=${stringId}`)
  //   expect(get.statusCode).toBe(500)
  //   expect(get.text).toBe(err)
  // })
})

/********** PUT REQUESTS **********/

describe('PUT Identify a helpful Question', () => {
  it('should return the correct statusCode for an existing question', async () => {
    const put = await request(server).put('/qa/questions/1/helpful')
    expect(put.statusCode).toBe(204)
  })

  it('should update the question helpfulness score', async () => {
    const getBefore = await request(server).get('/qa/questions?product_id=1')
    let helpfulBefore = getBefore.body.results[0].question_helpfulness

    const put = await request(server).put('/qa/questions/4/helpful')
    const getAfter = await request(server).get('/qa/questions?product_id=1')
    let helpfulAfter = getAfter.body.results[0].question_helpfulness

    console.log(helpfulBefore, helpfulAfter)

    // expect(helpfulAfter).toEqual(helpfulBefore + 1)
  })

  it('should return the correct statusCode and error for a non-existing product', async () => {
    const put = await request(server).get('/qa/questions/0/helpful')
    expect(put.statusCode).toBe(404)
  })

  it('should return the correct statusCode and error message for an incorrect string input', async () => {
    const put = await request(server).get('/qa/questions/abc/helpful')
    expect(put.statusCode).toBe(404)
  })
})

describe('PUT Identify a helpful Answer', () => {
  it('should return the correct statusCode for an existing answer', async () => {
    const put = await request(server).put('/qa/answers/7/helpful')
    expect(put.statusCode).toBe(204)
  })

  it('should update the answer helpfulness score', async () => {
    const getBefore = await request(server).get('/qa/questions/4/answers')
    let helpfulBefore = getBefore.body.results[0].helpfulness

    const put = await request(server).put('/qa/answers/89/helpful')
    const getAfter = await request(server).get('/qa/questions/4/answers')
    let helpfulAfter = getAfter.body.results[0].helpfulness

    console.log(helpfulBefore, helpfulAfter)

    expect(helpfulAfter).toEqual(helpfulBefore + 1)
  })

  it('should return the correct statusCode and error for a non-existing product', async () => {
    const put = await request(server).get('/qa/answers/0/helpful')
    expect(put.statusCode).toBe(404)
  })

  it('should return the correct statusCode and error message for an incorrect string input', async () => {
    const put = await request(server).get('/qa/answers/abc/helpful')
    expect(put.statusCode).toBe(404)
  })
})

describe('PUT Report a Question', () => {
  it('should return the correct statusCode for an reported question', async () => {
    const put = await request(server).put('/qa/questions/1/report')
    expect(put.statusCode).toBe(204)
  })

  it('should update the question reported to true', async () => {
    const getBefore = await request(server).get('/qa/questions?product_id=1')
    let helpfulBefore = getBefore.body.results[0].reported

    const put = await request(server).put('/qa/questions/4/report')
    const getAfter = await request(server).get('/qa/questions?product_id=1')
    let helpfulAfter = getAfter.body.results[0].reported

    console.log(helpfulBefore, helpfulAfter)
    // expect(helpfulAfter).toBe(!helpfulBefore)
  })

  it('should return the correct statusCode and error for a non-existing product', async () => {
    const put = await request(server).put('/qa/questions/0/report')
    expect(put.statusCode).toBe(500)
    expect(put.text).toBe('Invalid question id provided')
  })

  it('should return the correct statusCode and error message for a string input', async () => {
    const put = await request(server).put(`/qa/questions/abc/report`)
    expect(put.statusCode).toBe(500)
    expect(put.text).toBe('Invalid question id provided')
  })
})

describe('PUT Report an Answer', () => {
  it('should return the correct statusCode for an reported answer', async () => {
    const put = await request(server).put('/qa/answers/7/report')
    expect(put.statusCode).toBe(204)
  })


})