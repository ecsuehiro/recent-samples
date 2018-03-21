"use strict"
const router = require('express').Router()
const usersControllerFactory = require('../controllers/users.controller')
const validateBody = require('../filters/validate.body')
const user = require('../models/user')
const userLogin = require('../models/user.login')
const validateId = require('../filters/id.filter')
const Email = require("../models/user.confirm.email")
const passwordChange = require('../models/change.password')

module.exports = function (apiPrefix) {
  const usersController = usersControllerFactory(apiPrefix)

  router.get('/', usersController.read)
  router.get('/:id([0-9a-zA-Z]{24})', usersController.readById)
  router.get('/current', usersController.currentUser)
  router.get('/supporters', usersController.readSupporters)
  router.get('/my-clients', usersController.readMyClients)
  router.get('/my-supporters', usersController.readMySupporters)
  router.get('/my-supportees', usersController.readMyClients)
  router.get('/:id([0-9a-zA-Z]{24})/supporters', usersController.readSupportersById)
  router.post('/', validateBody(user), validateId.bodyIdDisallowed, usersController.create)
  router.post('/login', validateBody(userLogin), validateId.bodyIdDisallowed, usersController.login)
  router.post('/logout', usersController.logout)
  router.post("/:id([0-9a-fA-F]{24})/confirm-email", validateBody(Email), usersController.confirmEmail)
  router.put('/:id([0-9a-zA-Z]{24})', validateBody(user), validateId.bodyIdRequired, validateId.putIdsIdentical, usersController.update)
  router.delete('/:id([0-9a-zA-Z]{24})', usersController.deactivate)
  router.delete('/:id([0-9a-fA-F]{24})/supporters/:userId([0-9a-fA-F]{24})', usersController.deleteSupporter)
  router.post('/password', usersController.changePassword)


  return router
}
