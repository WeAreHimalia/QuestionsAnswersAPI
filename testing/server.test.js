const server = require('../server/index.js').server
const request = require('supertest')

beforeAll(done => {
  done()
})

afterAll(done => {
  server.close()
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

  it('should contain the proper data', async () => {
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

  it('should contain the proper data', async () => {
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
  it('should return the correct statusCode for a valid post', async () => {
    let body = {
      body: 'post test',
      name: 'Posty McPost',
      email: 'test@test.com',
      product_id: 1
    }

    const post = await request(server).post('/qa/questions').send(body)
    expect(post.statusCode).toBe(201)
    expect(post.text).toBe('Created')
  })

  it('should return an error if any parameters are included', async () => {
    const post = await request(server).post('/qa/questions/test')
    expect(post.statusCode).toBe(404)
  })

  it('should return the right error message if no body is included', async () => {
    let invalidPost = {}

    const post = await request(server).post('/qa/questions').send(invalidPost)
    expect(post.statusCode).toBe(500)
    expect(post.text).toBe('Please submit a valid question')
  })

  it('should return the right error message if part of the body is missing', async () => {
    let invalidKeys = {
      name: 'invalid test',
      body: 'invalid test'
    }

    const post = await request(server).post('/qa/questions').send(invalidKeys)
    expect(post.statusCode).toBe(500)
    expect(post.text).toBe('Invalid Question Post entry')
  })

  it('should be able to retrieve the posted question', async () =>{
    let body = {
      body: 'post test',
      name: 'Posty McPost',
      email: 'test@test.com',
      // this may need to be updated over time as this only returns 5 responses
      product_id: 1000015
    }

    const getCount = await request(server).get('/qa/counts')
    const post = await request(server).post('/qa/questions').send(body)
    const get = await request(server).get(`/qa/questions?product_id=${body.product_id}`)

    let questions = getCount.body.questions + 1
    let results = get.body.results
    let test = false

    results.forEach(item => {
      if (item.question_id === questions) {
        test = true
      }
    })

    expect(test).toBe(true)
  })
})

describe('POST an Answer for a single Question', () => {
  it('should return the correct statusCode for a valid post', async () => {
    let body = {
      body: 'post test',
      name: 'Posty McPost',
      email: 'test@test.com',
      photos: []
    }

    const post = await request(server).post('/qa/questions/1000010/answers').send(body)
    expect(post.statusCode).toBe(201)
    expect(post.text).toBe('Created')
  })

  it('should return an error if any parameters are included', async () => {
    const post = await request(server).post('/qa/questions/1000010/answers/test')
    expect(post.statusCode).toBe(404)
  })

  it('should return the right error message if no body is included', async () => {
    let invalidPost = {}

    const post = await request(server).post('/qa/questions/1000010/answers').send(invalidPost)
    expect(post.statusCode).toBe(500)
    expect(post.text).toBe('Please submit a valid answer')
  })

  it('should return the right error message if part of the body is missing', async () => {
    let invalidKeys = {
      name: 'invalid test',
      body: 'invalid test'
    }

    const post = await request(server).post('/qa/questions/1000010/answers').send(invalidKeys)
    expect(post.statusCode).toBe(500)
    expect(post.text).toBe('Invalid Answer Post entry')
  })

  it('should be able to retrieve the posted answer', async () =>{
    let body = {
      body: 'post test',
      name: 'Posty McPost',
      email: 'test@test.com',
      photos: []
    }

    const getCount = await request(server).get('/qa/counts')
    // this may need to be updated over time as this only returns 5 responses
    const post = await request(server).post('/qa/questions/3519043/answers').send(body)
    // this may need to be updated over time as this only returns 5 responses
    const get = await request(server).get('/qa/questions?product_id=1000013')

    let answers = getCount.body.answers + 1
    let results = get.body.results
    let test = false

    results.forEach(item => {
      let keys = Object.keys(item.answers)
      if (keys.includes(answers.toString())) {
        test = true
      }
    })

    expect(test).toBe(true)
  })
})

/********** PUT REQUESTS **********/

describe('PUT Identify a helpful Question', () => {
  it('should return the correct statusCode for an existing question', async () => {
    const put = await request(server).put('/qa/questions/1/helpful')
    expect(put.statusCode).toBe(204)
  })

  it('should update the question helpfulness score', async () => {
    const getBefore = await request(server).get('/qa/questions?product_id=1')
    let thisQuestion = getBefore.body.results[0].question_id
    let helpfulBefore = getBefore.body.results[0].question_helpfulness

    const put = await request(server).put(`/qa/questions/${thisQuestion}/helpful`)
    const getAfter = await request(server).get('/qa/questions?product_id=1')
    let helpfulAfter = getAfter.body.results[0].question_helpfulness

    expect(helpfulAfter).toBe(helpfulBefore + 1)
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
    let id = getBefore.body.results[0].question_id

    await request(server).put(`/qa/questions/${id}/report`)
    const getAfter = await request(server).get('/qa/questions?product_id=1')
    let after = getAfter.body.results[0].question_id
    await request(server).put(`/qa/questions/${id}/report`)

    const getFinal = await request(server).get('/qa/questions?product_id=1')

    expect(id === after).toBe(false)
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

  it('should update the answer reported to true', async () => {
    const getBefore = await request(server).get('/qa/questions/5/answers')
    let id = getBefore.body.results[0].answer_id

    await request(server).put(`/qa/answers/${id}/report`)
    const getAfter = await request(server).get('/qa/questions/5/answers')
    let after = getAfter.body.results[0].answer_id
    await request(server).put(`/qa/answers/${id}/report`)

    const getFinal = await request(server).get('/qa/questions/5/answers')

    expect(id === after).toBe(false)
  })

  it('should return the correct statusCode and error for a non-existing question', async () => {
    const put = await request(server).put('/qa/answers/0/report')
    expect(put.statusCode).toBe(500)
    expect(put.text).toBe('Invalid answer id provided')
  })

  it('should return the correct statusCode and error message for a string input', async () => {
    const put = await request(server).put(`/qa/answers/abc/report`)
    expect(put.statusCode).toBe(500)
    expect(put.text).toBe('Invalid answer id provided')
  })
})