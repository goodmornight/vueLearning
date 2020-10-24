const Test = require('../resources/test')

module.exports = (app) => {

  app.get('/api/test', (request, response) => {
    response.json(Test)
  })

}
