'use strict';

var config = {};
config.env = 'development'
config.jwt = {}
if (config.env == "development") {
    config.name = "Ganache"
    config.provider = "HTTP://127.0.0.1:8545"
    config.chainId = "0xf"
    // config.account1 = "0x197eB47771f6996B47ad44457169f799A527bBd2"
    // config.account2 = "0xc8d5212cCbA522eff0BF1C08DBd095C9F8F4B4C6"
    // config.privKey1 = "565f9b3bcc71dd522c41cd69bfe4dd70de7d78c2712d0e9e17ca6346630a7906"
    // config.privKey2 = "ca74fb65fc705839da94f7eda1cb4b86bbc34e212e28497add29dc6f85d7934e"
    config.TxGasLimit = 30000
    config.contractGasLimit = 1000000

}
else if (config.env == "testnet") {
    config.name = "Ropsten"
    config.chainId = "0x03"
    config.provider = "https://ropsten.infura.io/v3/635e8595f67545adbb5e436f40f7950d"
    // config.account1 = "0x00BEFBec4AA42230E88b8fF6291Aeba25a5eb887"
    // config.account2 = "0xF1638221192ebeB5B423ECC984cE737e44FB1a97"
    // config.privKey1 = "99AEFD83452290F6B4CA17D9950ED6856FEE24FCCF2BE3FD30489DA9B72815B4"
    // config.privKey2 = "5844FA7A2A073DEB6F01C1CB2F04AFD71F62AFAC604078DA6163D4C3DEB3EF3F"
    config.TxGasLimit = 30000
    config.contractGasLimit = 4000000
}
else if (config.env == "production") {
    config.provider = "mainnet"
}

// Mongo
config.db = {}
config.server = {}
config.db.name = 'ethereum_service'
config.server.host = '127.0.0.1'
config.server.port = 3002
config.db.username = 'blocks-dev-mongo-user'
config.db.password = 'G6BFnBy8yIZkGdie'
config.db.hosts = ['127.0.0.1:27017']
config.db.options = {
    reconnectTries: 2000
    // , reconnectInterval: 1000, forceServerObjectId: true,
    // bufferMaxEntries: 0, poolSize: 10, useNewUrlParser: true
}
config.db.optionsMongoose = {
    reconnectTries: 2000, reconnectInterval: 1000, forceServerObjectId: true,
    autoIndex: false, poolSize: 10, useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false
}
config.db.uri = 'mongodb://' + config.db.hosts[0] + '/' + config.db.name

// Logs
config.logs = {}
config.logs.api = {}
config.logs.api.category = "API"
config.logs.api.path = "/var/log/simply_block/microservices/ethereum_service/"

module.exports = config;
