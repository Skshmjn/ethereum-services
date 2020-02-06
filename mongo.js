'use strict';

//Direct DB connection for transactions
const MongoClient = require('mongodb').MongoClient
var conf = require('./config.js')
var mongoose = require('mongoose')
const uri = conf.db.uri
var _db 
let options = conf.db.options
const connectDB =() => {
    return MongoClient.connect(uri, options).then((db) => {
        _db = db.db(conf.db.name)
         mongoose.connect(uri,conf.db.optionsMongoose).then(
            () => { console.log('MONGOOSE: Connected to DB')/*promise resolves to undefined. */ },
            err => {console.log(err) }
        )
         return new Promise((resolve,reject)=>{resolve(_db)})
     }).catch((err)=>{
         return new Promise((resolve,reject)=>{reject(err)})
     })
}

const getDB = () => _db
const disconnectDB = () => _db.close()
//Mongoose connection 

module.exports = { mongoose,connectDB, getDB, disconnectDB, MongoClient }