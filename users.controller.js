"use strict"

const responses = require('../models/responses')
const passwordChange = require('../models/change.password')
const usersService = require('../services/users.service')
const emailsService = require("../services/emails.service")

let _apiPrefix

module.exports = apiPrefix => {
    _apiPrefix = apiPrefix
    return {
        read: _read,
        create: _create,
        update: _update,
        deactivate: _deactivate,
        readById: _readById,
        login: _login,
        logout: _logout,
        currentUser: _currentUser,
        confirmEmail: _confirmEmail,
        readClients: _readClients,
        readSupporters: _readSupporters,
        readTherapists: _readTherapists,
        readMySupporters: _readMySupporters,
        deleteSupporter: _deleteSupporter,
        readMyClients: _readMyClients,
        changePassword: _changePassword,
        readSupportersById: _readSupportersById
    }
}



function _read(req, res) {
    usersService.read()
        .then(users => {
            const responseModel = new responses.ItemsResponse()
            responseModel.items = users
            res.json(responseModel)
        })
        .catch(xhr => {
            console.log(xhr)
            res.status(500).send(new responses.ErrorResponse(xhr))
        })
}

function _readBySupporterId(req, res) {
    usersService.readBySupporterId(req.params.id)
        .then(clients => {
            const responseModel = new responses.ItemResponse()
            responseModel.item = clients
            res.json(responseModel)
        })
        .catch(xhr => {
            console.log(xhr)
            res.status(500).send(new responses.ErrorResponse(xhr))
        })
}

function _readById(req, res) {
    usersService.readById(req.params.id)
        .then(users => {
            const responseModel = new responses.ItemResponse()
            responseModel.item = users
            res.json(responseModel)
        })
        .catch(err => {
            console.log(err)
            res.status(500).send(new responses.ErrorResponse(err))
        })
}

function _deleteSupporter(req, res) {
    usersService.deleteSupporter(req.auth.userId, req.params.userId)
        .then(response => {
            const responseModel = new responses.ItemResponse()
            res.status(200).json(responseModel)
        })
        .catch(err => {
            console.log(err)
            return res.status(500).send(new responses.ErrorResponse(err))
        })
}

function _create(req, res) {
    let userId
    usersService.create(req.model)
        .then(data => {
            userId = data
            if (req.model.userType === 'Supporter') { return }
            const toName = `${req.model.firstName} ${req.model.lastName}`
            return emailsService.sendRegistrationConfirmation(req.model.email, userId, toName)
        })
        .then(id => {
            id = userId
            const responseModel = new responses.ItemResponse()
            responseModel.item = id
            return res.status(201).location(`${_apiPrefix}/${id}`).json(responseModel)
        })
        .catch(err => {
            console.log(err)
            res.status(500).send(new responses.ErrorResponse(err))
        })
}

function _update(req, res) {
    usersService.update(req.params.id, req.model)
        .then(response => {
            const responseModel = new responses.ItemResponse()
            res.status(200).json(responseModel)
        })
        .catch(err => {
            console.log(err)
            res.status(500).send(new responses.ErrorResponse(err))
        })
}

function _changePassword(req, res) {
    debugger
    usersService.readById(req.auth.userId)
        .then(user => {
            if (req.body.currentPassword !== user.password) {
                console.log('failed password update')
                res.status(500).send(new responses.ErrorResponse)
            } else {
                user.password = req.body.newPassword
                return usersService.update(user._id, user)
            }
        })
        .then(response => {
            const responseModel = new responses.ItemResponse()
            res.status(200).json(responseModel)
        })
        .catch(err => {
            console.log(err)
            res.status(500).send(new responses.ErrorResponse(err))
        })
}


function _confirmEmail(req, res) {
    usersService.updateIsEmailConfirmed(req.params.id)
        .then(response => {
            const responseModel = new responses.ItemResponse()
            res.status(200).json(responseModel)
        })
        .catch(err => {
            res.status(500).send(new responses.ErrorResponse(err))
        })
}

function _deactivate(req, res) {
    usersService.deactivate(req.params.id)
        .then(response => {
            const responseModel = new responses.ItemResponse()
            res.status(200).json(responseModel)
        })
        .catch(err => {
            console.log(err)
            res.status(500).send(new responses.ErrorResponse(err))
        })
}

// If document is found and email is confirmed, set user cookie
function _login(req, res) {
    usersService.login(req.model.username, req.model.password)
        .then(user => {
            // Check if a user exists and user.isEmailConfirmed is true
            if (user && user.isEmailConfirmed) {
                // Setting a cookie named 'auth' which expires after a year
                res.cookie('auth', { userId: user._id, userType: user.userType }, { maxAge: 365 * 24 * 60 * 60 * 1000 })
                res.status(200).send(new responses.SuccessResponse("Login successful"))
            } else {
                // NOTE: Keeping error message broad so client won't know if user exist in database or not
                res.status(400).send("Login attempt failed")
                return
            }
        })
        .catch(error => {
            console.warn(error)
            res.status(500).send(new responses.ErrorResponse(error))
        })
}

function _logout(req, res) {
    res.clearCookie("auth")
    const responseModel = new responses.ItemResponse()
    res.status(200).json(responseModel)
}

function _currentUser(req, res) {
    if (!req.auth) {
        res.send('You must be logged in.')
        return
    }
    usersService.readById(req.auth.userId)
        .then(users => {
            const responseModel = new responses.ItemResponse()
            responseModel.item = users
            res.json(responseModel)
        })
        .catch(err => {
            console.log(err)
            res.status(500).send(new responses.ErrorResponse(err))
        })
}

function _readClients(req, res) {
    usersService.readClients()
        .then(users => {
            const responseModel = new responses.ItemsResponse()
            responseModel.items = users
            res.json(responseModel)
        })
        .catch(xhr => {
            console.log(xhr)
            res.status(500).send(new responses.ErrorResponse(xhr))
        })
}

function _readSupporters(req, res) {
    usersService.readSupporters()
        .then(users => {
            const responseModel = new responses.ItemsResponse()
            responseModel.items = users
            res.json(responseModel)
        })
        .catch(xhr => {
            console.log(xhr)
            res.status(500).send(new responses.ErrorResponse(xhr))
        })
}

function _readTherapists(req, res) {
    usersService.readTherapists()
        .then(users => {
            const responseModel = new responses.ItemsResponse()
            responseModel.items = users
            res.json(responseModel)
        })
        .catch(xhr => {
            console.log(xhr)
            res.status(500).send(new responses.ErrorResponse(xhr))
        })
}

function _readMySupporters(req, res) {
    usersService.readById(req.auth.userId)
        .then(currentUser => {
            return usersService.readByIds(currentUser.supporterIds)

        })
        .then(users => {
            const responseModel = new responses.ItemsResponse()
            responseModel.items = users
            res.json(responseModel)
        })
        .catch(xhr => {
            console.log(xhr)
            res.status(500).send(new responses.ErrorResponse(xhr))
        })
}

function _readSupportersById(req, res) {
    usersService.readById(req.params.id)
        .then(users => {
            return usersService.readByIds(users.supporterIds)
        })
        .then(supporters => {
            const responseModel = new responses.ItemsResponse()
            responseModel.items = supporters
            res.json(responseModel)
        })
        .catch(err => {
            console.log(err)
            res.status(500).send(new responses.ErrorResponse(err))
        })
}

function _readMyClients(req, res) {
    usersService.readBySupporterId(req.auth.userId)
        .then(clients => {
            const responseModel = new responses.ItemsResponse()
            responseModel.items = clients
            res.json(responseModel)
        })
        .catch(xhr => {
            console.log(xhr)
            res.status(500).send(new responses.ErrorResponse(xhr))
        })
}

