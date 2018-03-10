"use strict"

const User = require("../models/user")
const mongodb = require("../mongodb")
const conn = mongodb.connection
const ObjectId = mongodb.ObjectId

module.exports = {
  login: _login,
  read: _read,
  create: _create,
  update: _update,
  deactivate: _deactivate,
  readById: _readById,
  readClients: _readClients,
  readTherapists: _readTherapists,
  readSupporters: _readSupporters,
  updateIsEmailConfirmed: _updateIsEmailConfirmed,
  readByIds: _readByIds,
  deleteSupporter: _deleteSupporter,
  readByUsername: _readByUsername,
  readBySupporterId: _readBySupporterId
}

function _login(username, password) {
  return conn.db().collection("users").findOne({ username: username, password: password, dateDeactivated: null })
    .then(user => {
      user._id = user._id.toString()
      return user
    })
    .catch(err => {
      console.warn(err)
      return Promise.reject(err)
    })
}

function _readBySupporterId(supporterId) {
  return conn.db().collection("users").find({ supporterIds: new ObjectId(supporterId), dateDeactivated: null }).toArray()
    .then(datas => {
      const clients = []
      for (let data of datas) {
        // Get rid of user sensitive information
        clients.push({
          _id: data._id.toString(),
          firstName: data.firstName,
          lastName: data.lastName,
          username: data.username,
          userType: data.userType,
          imageUrl: data.imageUrl
        })
      }
      return clients
    })
    .catch(err => {
      console.warn(err)
      return Promise.reject(err)
    })
}

function _read() {
  return conn.db().collection("users").find({ dateDeactivated: null }).toArray()
    .then(clients => {
      for (let j = 0; j < clients.length; j++) {
        const client = clients[j];
        client._id = client._id.toString()
        for (let i = 0; i < client.supporterIds.length; i++) {
          const supporters = client.supporterIds
          supporters[i] = supporters[i].toString()
        }
      }
      return clients
    })
    .catch(err => {
      console.warn(err)
      return Promise.reject(err)
    })
}



function _readSupporters() {
  return conn.db().collection("users").find({ userType: "Supporter", dateDeactivated: null }).toArray()
    .then(clients => {
      for (let s = 0; s < clients.length; s++) {
        let client = clients[s]
        client._id = client._id.toString()
        for (let i = 0; i < client.supporterIds.length; i++) {
          const supporters = client.supporterIds
          supporters[i] = supporters[i].toString()
        }
      }
      return clients
    })
    .catch(err => {
      console.warn(err)
      return Promise.reject(err)
    })
}

function _readClients() {
  return conn.db().collection("users").find({ userType: "Client", dateDeactivated: null }).toArray()
    .then(clients => {
      for (let j = 0; j < clients.length; j++) {
        const client = clients[j];
        client._id = client._id.toString()
        for (let i = 0; i < client.supporterIds.length; i++) {
          const supporters = client.supporterIds
          supporters[i] = supporters[i].toString()
        }
      }
      return clients
    })
    .catch(err => {
      console.warn(err)
      return Promise.reject(err)
    })
}

function _readTherapists() {
  return conn.db().collection('users').find({ userType: "Therapist", dateDeactivated: null }).toArray()
    .then(therapists => {
      for (let j = 0; j < therapists.length; j++) {
        const therapist = therapists[j]
        therapist._id = therapist._id.toString()
        for (let i = 0; i < therapist.supporterIds.length; i++) {
          const supporters = therapist.supporterIds
          supporters[i] = supporters[i].toString()
        }
      }
      return therapists
    })
    .catch(err => {
      console.warn(err)
      return Promise.reject(err)
    })
}

function _readByIds(ids) {
  for (let i = 0; i < ids.length; i++) {
    ids[i] = new ObjectId(ids[i])
  }
  return conn.db().collection("users").find({ _id: { $in: ids } }).toArray()
    .then(client => {
      return client
    })
    .catch(err => {
      console.warn(err)
      return Promise.reject(err)
    })
}

function _readByUsername(username) {
  return conn.db().collection("users").findOne({ username: username, dateDeactivated: null })
    .then(user => {
      return user
    }).catch(err => {
      console.warn(err)
      return Promise.reject(err)
    })
}

function _readById(id) {
  return conn.db().collection("users").findOne({ _id: new ObjectId(id), dateDeactivated: null })
    .then(client => {
      client._id = client._id.toString()
      for (let i = 0; i < client.supporterIds.length; i++) {
        const support = client.supporterIds
        support[i] = support[i].toString()
      }
      return client
    })
    .catch(err => {
      console.warn(err)
      return Promise.reject(err)
    })
}

function _create(data) {
  const document = {
    firstName: data.firstName,
    lastName: data.lastName,
    username: data.username,
    imageUrl: data.imageUrl,
    phone: data.phone,
    email: data.email,
    supporterIds: [],
    password: data.password,
    userType: data.userType,
    agreesToPrivacyStatement: data.agreesToPrivacyStatement,
    dateCreated: new Date(),
    dateModified: new Date(),
    dateDeactivated: null
  }

  if ((data.userType == "Client" || data.userType == 'Therapist') && (data.supporterIds)) {
    for (let i = 0; i < data.supporterIds.length; i++) {
      document.supporterIds.push(new ObjectId(data.supporterIds[i]))
    }
  } else {
    data.supporterIds = []
  }
  if (typeof data.isEmailConfirmed === "boolean") {
    document.isEmailConfirmed = data.isEmailConfirmed
  }

  return conn.db().collection("users").insertOne(document)
    .then(response => response.insertedId.toString())
    .catch(err => {
      if (err.code == 11000) {
        err.unique = false
      }
      console.warn(err)
      return Promise.reject(err)
    })
}

function _update(id, data) {
  const document = {
    $set: {
      firstName: data.firstName,
      lastName: data.lastName,
      imageUrl: data.imageUrl,
      phone: data.phone,
      email: data.email,
      supporterIds: [],
      password: data.password,
      userType: data.userType,
      agreesToPrivacyStatement: data.agreesToPrivacyStatement,
      dateModified: new Date(),
      _id: new ObjectId(data._id)
    }
  }

  if ((data.userType == "Client" || data.userType == 'Therapist') && (data.supporterIds)) {
    for (let i = 0; i < data.supporterIds.length; i++) {
      document.$set.supporterIds.push(new ObjectId(data.supporterIds[i]))
    }
  } else {
    data.supporterIds = []
  }
  if (typeof data.isEmailConfirmed === "boolean") {
    document.$set.isEmailConfirmed = data.isEmailConfirmed
  }

  return conn.db().collection("users").updateOne({ _id: new ObjectId(id) }, document)
    .then(response => {
      return response.matchedCount
    })
    .catch(err => {
      console.warn(err)
      return Promise.reject(err)
    })
}

function _updateIsEmailConfirmed(id) {
  const emailDoc = {
    $set: {
      isEmailConfirmed: true,
      dateModified: new Date()
    }
  }

  return conn.db().collection("users").updateOne({ _id: new ObjectId(id) }, emailDoc)
    .then(response => {
      return response.matchedCount
    })
    .catch(err => {
      Promise.reject(err)
    })
}

function _deactivate(id) {
  const document = {
    $set: {
      dateModified: new Date(),
      dateDeactivated: new Date()
    }
  }
  return conn.db().collection('users').updateOne({ _id: new ObjectId(id) }, document)
    .then(response => {
      return response.matchedCount
    })
    .catch(err => {
      console.warn(err)
      return Promise.reject(err)
    })
}

function _deleteSupporter(id, supporter) {

  return conn.db().collection('users').update({ _id: new ObjectId(id) }, { $pull: { supporterIds: new ObjectId(supporter) } })
    .then(result => { return result.matchedCount })

    .catch(err => {
      console.warn(err)
      return Promise.reject(err)
    })
}

