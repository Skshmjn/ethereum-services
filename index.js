'use strict'
var express = require('express');
var bodyParser = require('body-parser')
var app = express();
const utils = require('./utils');
const config = require('./config');
const ContractERC20 = require('./ContractERC20');
var Web3 = require('web3')
const Errors = require("./errors")
const MyLogger = require("./logging")
var customException = require('./customException')
const web3 = new Web3(new Web3.providers.HttpProvider(config.provider));
var MongoDB = require("./mongo")

// App
app.use(bodyParser.json())       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }))// to support URL-encoded bodies

// Create Connections
MongoDB.connectDB().
    then((newDB)=>{
        console.log("DB : Db connected")
        app.listen(config.server.port, config.server.host, function(){
            console.log('listening on http://' + (config.server.host || "0.0.0.0") + ":" + (config.server.port || 5000));
        });
        console.log("System Initialization completed")
    }).
    catch((err)=>{
        console.log(err)
        console.log("DB : Connection error. Stopping")
    })


app.post('/get-token-balance/', async function (req, res) {
    try {
        // Create Logger
        var logger = new MyLogger(config.logs.api.category, config.logs.api.path)
        logger.CreateLogger()

        if (!req.body.contractAddress || !req.body.userAddress) {
            var objError = Errors.ProvideRequiredParmeters
            return res.json(await utils.errorResponse(objError.message, objError.errorCode))
        }
        var contractObj = new ContractERC20(req.body.contractAddress, "./build/:DappToken.json", web3)
        let bal = await contractObj.balanceOf(req.body.userAddress)
        if (bal !== undefined) {
            return res.json(await utils.successResponse({},{"balance": bal }))
        }
        else {
            objError = Errors.SomeErrorOccurred
            return res.json(await utils.errorResponse(objError.message, objError.errorCode))
        }
    }
    catch (err) {
        console.error(err)
        logger.LogError("get-token-balance : " + err.stack)
        return res.json(await utils.errorResponse(err, -999))
    }
})

app.post('/get-token-freeze/', async function (req, res) {
    try {
        // Create Logger
        var logger = new MyLogger(config.logs.api.category, config.logs.api.path)
        logger.CreateLogger()
        
        if (!req.body.contractAddress || !req.body.userAddress) {
            var objError = Errors.ProvideRequiredParmeters
            return res.json(await utils.errorResponse(objError.message, objError.errorCode))
        }
        var contractObj = new ContractERC20(req.body.contractAddress, "./build/:DappToken.json", web3)
        let bal = await contractObj.freezeOf(req.body.userAddress)
        if (bal !== undefined) {
            return res.json(await utils.successResponse({},{"balance": bal }))
        }
        else {
            objError = Errors.SomeErrorOccurred
            return res.json(await utils.errorResponse(objError.message, objError.errorCode))
        }
    }
    catch (err) {
        console.error(err)
        logger.LogError("get-token-freeze : " + err.stack)
        return res.json(await utils.errorResponse(err, -999))
    }
})

app.post('/get-token-name/', async function (req, res) {
    try {

        // Create Logger
        var logger = new MyLogger(config.logs.api.category, config.logs.api.path)
        logger.CreateLogger()

        if (!req.body.contractAddress) {
            var objError = Errors.ProvideRequiredParmeters
            return res.json(await utils.errorResponse(objError.message, objError.errorCode))
        }
        var contractObj = new ContractERC20(req.body.contractAddress, "./build/:DappToken.json", web3)
        let name = await contractObj.name()
        if (name !== undefined) {
            return res.json(await utils.successResponse({},{"name": name }))
        }
        else {
            objError = Errors.SomeErrorOccurred
            return res.json(await utils.errorResponse(objError.message, objError.errorCode))
        }
    }
    catch (err) {
        console.error(err)
        logger.LogError("get-token-name : " + err.stack)
        return res.json(await utils.errorResponse(err, -999))
    }
})

app.post('/get-totalsupply/', async function (req, res) {
    try {

        // Create Logger
        var logger = new MyLogger(config.logs.api.category, config.logs.api.path)
        logger.CreateLogger()

        if (!req.body.contractAddress) {
            var objError = Errors.ProvideRequiredParmeters
            return res.json(await utils.errorResponse(objError.message, objError.errorCode))
        }
        var contractObj = new ContractERC20(req.body.contractAddress, "./build/:DappToken.json", web3)
        let ts = await contractObj.totalSupply()
        if (ts !== undefined) {
            return res.json(await utils.successResponse({},{"Total Supply": ts }))
        }
        else {
            objError = Errors.SomeErrorOccurred
            return res.json(await utils.errorResponse(objError.message, objError.errorCode))
        }
    }
    catch (err) {
        console.error(err)
        logger.LogError("get-totalsupply : " + err.stack)
        return res.json(await utils.errorResponse(err, -999))
    }
})

app.post('/get-decimals/', async function (req, res) {
    try {

        // Create Logger
        var logger = new MyLogger(config.logs.api.category, config.logs.api.path)
        logger.CreateLogger()
        
        if (!req.body.contractAddress) {
            var objError = Errors.ProvideRequiredParmeters
            return res.json(await utils.errorResponse(objError.message, objError.errorCode))
        }
        var contractObj = new ContractERC20(req.body.contractAddress, "./build/:DappToken.json", web3)
        let d = await contractObj.decimals()
        if (d !== undefined) {
            return res.json(await utils.successResponse({},{"Decimals": d }))
        }
        else {
            objError = Errors.SomeErrorOccurred
            return res.json(await utils.errorResponse(objError.message, objError.errorCode))
        }
    }
    catch (err) {
        console.error(err)
        logger.LogError("get-decimals : " + err.stack)
        return res.json(await utils.errorResponse(err, -999))
    }
})

app.post('/get-token-symbol/', async function (req, res) {
    try {

        // Create Logger
        var logger = new MyLogger(config.logs.api.category, config.logs.api.path)
        logger.CreateLogger()

        if (!req.body.contractAddress) {
            var objError = Errors.ProvideRequiredParmeters
            return res.json(await utils.errorResponse(objError.message, objError.errorCode))
        }
        var contractObj = new ContractERC20(req.body.contractAddress, "./build/:DappToken.json", web3)
        let s = await contractObj.symbol()
        if (s !== null) {
            return res.json(await utils.successResponse({},{"Symbol": s }))
        }
        else {
            objError = Errors.SomeErrorOccurred
            return res.json(await utils.errorResponse(objError.message, objError.errorCode))
        }
    }
    catch (err) {
        console.error(err)
        logger.LogError("get-token-symbol : " + err.stack)
        return res.json(await utils.errorResponse(err, -999))
    }
})

app.post('/get-allowance/', async function (req, res) {
    try {

        // Create Logger
        var logger = new MyLogger(config.logs.api.category, config.logs.api.path)
        logger.CreateLogger()
        
        if (!req.body.contractAddress || !req.body.address1 || !req.body.address2) {
            var objError = Errors.ProvideRequiredParmeters
            return res.json(await utils.errorResponse(objError.message, objError.errorCode))
        }
        var contractObj = new ContractERC20(req.body.contractAddress, "./build/:DappToken.json", web3)
        let all = await contractObj.allowance(req.body.address1, req.body.address2)
        if (all !== null) {
            return res.json(await utils.successResponse({},{"Allowance": all }))
        }
        else {
            objError = Errors.SomeErrorOccurred
            return res.json(await utils.errorResponse(objError.message, objError.errorCode))
        }
    }
    catch (err) {
        console.error(err)
        logger.LogError("get-allowance : " + err.stack)
        return res.json(await utils.errorResponse(err, -999))
    }
})

app.post('/transfer/', async function (req, res) {
    try {

        // Create Logger
        var logger = new MyLogger(config.logs.api.category, config.logs.api.path)
        logger.CreateLogger()
        
        if (!req.body.privatekey || !req.body.contractAddress || !req.body.toAddress || !req.body.amount) {
            var objError = Errors.ProvideRequiredParmeters
            return res.json(await utils.errorResponse(objError.message, objError.errorCode))
        }
        var contractObj = new ContractERC20(req.body.contractAddress, "./build/:DappToken.json", web3)
        var {txHash, sender, fee} = await contractObj.transfer(req.body.privatekey, req.body.toAddress, req.body.amount)
        if (txHash !== null) {
            let dbParams = {
                "tx_hash" : txHash,
                "contract_address" : req.body.contractAddress,
                "from_address" : sender,
                "to_address" : req.body.toAddress,
                "token_amount" : req.body.amount,
                "confirmations" : 0,
                "block_number" : -1,
                "fee_in_wei" : fee,
                "function_name" : "transfer"
            }

            return res.json(await utils.successResponse(dbParams,{"tx_hash": txHash, "fee_in_wei" : fee }))
        }
        else {
            objError = Errors.SomeErrorOccurred
            return res.json(await utils.errorResponse(objError.message, objError.errorCode))
        }
    }
    catch(err){

        if(err instanceof customException){
            var response = await utils.errorResponse(err.message, err.extra)
        }else{
            console.log(err)
            var objError = errors.SomeErrorOccurred
            var response = await utils.errorResponse(objError.message, objError.errorCode)
        }
        logger.LogError("transfer : " + err)
        res.send(response)
    }
})

app.post('/burn/', async function (req, res) {
    try {

        // Create Logger
        var logger = new MyLogger(config.logs.api.category, config.logs.api.path)
        logger.CreateLogger()

        if (!req.body.privatekey || !req.body.contractAddress || !req.body.amount) {
            var objError = Errors.ProvideRequiredParmeters
            return res.json(await utils.errorResponse(objError.message, objError.errorCode))
        }
        var contractObj = new ContractERC20(req.body.contractAddress, "./build/:DappToken.json", web3)
        let {txHash, sender, fee} = await contractObj.burn(req.body.privatekey, req.body.amount)
        if (txHash !== null) {
            let dbParams = {
                "tx_hash" : txHash,
                "contract_address" : req.body.contractAddress,
                "from_address" : sender,
                "to_address" : "NA",
                "token_amount" : req.body.amount,
                "confirmations" : 0,
                "block_number" : -1,
                "fee_in_wei" : fee,
                "function_name" : "burn"
            }
            return res.json(await utils.successResponse(dbParams,{"tx_hash": txHash,  "fee_in_wei" : fee }))
        }
        else {
            objError = Errors.SomeErrorOccurred
            return res.json(await utils.errorResponse(objError.message, objError.errorCode))
        }
    }
    catch(err){

        if(err instanceof customException){
            var response = await utils.errorResponse(err.message, err.extra)
        }else{
            console.log(err)
            var objError = errors.SomeErrorOccurred
            var response = await utils.errorResponse(objError.message, objError.errorCode)
        }
        logger.LogError("burn : " + err)
        res.send(response)
    }
})

app.post('/freeze/', async function (req, res) {
    try {
        
        // Create Logger
        var logger = new MyLogger(config.logs.api.category, config.logs.api.path)
        logger.CreateLogger()

        if (!req.body.privatekey || !req.body.contractAddress || !req.body.amount) {
            var objError = Errors.ProvideRequiredParmeters
            return res.json(await utils.errorResponse(objError.message, objError.errorCode))
        }
        var contractObj = new ContractERC20(req.body.contractAddress, "./build/:DappToken.json", web3)
        let {txHash, sender, fee} = await contractObj.freeze(req.body.privatekey, req.body.amount)
        if (txHash !== null) {
            let dbParams = {
                "tx_hash" : txHash,
                "contract_address" : req.body.contractAddress,
                "from_address" : sender,
                "to_address" : "NA",
                "token_amount" : req.body.amount,
                "confirmations" : 0,
                "block_number" : -1,
                "fee_in_wei" : fee,
                "function_name" : "freeze"
            }
            return res.json(await utils.successResponse(dbParams,{"tx_hash": txHash,  "fee_in_wei" : fee }))
        }
        else {
            objError = Errors.SomeErrorOccurred
            return res.json(await utils.errorResponse(objError.message, objError.errorCode))
        }
    }
    catch(err){

        if(err instanceof customException){
            var response = await utils.errorResponse(err.message, err.extra)
        }else{
            console.log(err)
            var objError = errors.SomeErrorOccurred
            var response = await utils.errorResponse(objError.message, objError.errorCode)
        }
        logger.LogError("freeze : " + err)
        res.send(response)
    }
})

app.post('/unfreeze/', async function (req, res) {
    try {

        // Create Logger
        var logger = new MyLogger(config.logs.api.category, config.logs.api.path)
        logger.CreateLogger()

        if (!req.body.privatekey || !req.body.contractAddress || !req.body.amount) {
            var objError = Errors.ProvideRequiredParmeters
            return res.json(await utils.errorResponse(objError.message, objError.errorCode))
        }
        var contractObj = new ContractERC20(req.body.contractAddress, "./build/:DappToken.json", web3)
        let {txHash, sender, fee} = await contractObj.unfreeze(req.body.privatekey, req.body.amount)
        if (txHash !== null) {
            let dbParams = {
                "tx_hash" : txHash,
                "contract_address" : req.body.contractAddress,
                "from_address" : sender,
                "to_address" : "NA",
                "token_amount" : req.body.amount,
                "confirmations" : 0,
                "block_number" : -1,
                "fee_in_wei" : fee,
                "function_name" : "unfreeze"
            }
            return res.json(await utils.successResponse(dbParams,{"tx_hash": txHash,  "fee_in_wei" : fee }))
        }
        else {
            objError = Errors.SomeErrorOccurred
            return res.json(await utils.errorResponse(objError.message, objError.errorCode))
        }
    }
    catch(err){

        if(err instanceof customException){
            var response = await utils.errorResponse(err.message, err.extra)
        }else{
            console.log(err)
            var objError = errors.SomeErrorOccurred
            var response = await utils.errorResponse(objError.message, objError.errorCode)
        }
        logger.LogError("unfreeze : " + err)
        res.send(response)
    }
})

app.post('/approve/', async function (req, res) {
    try {

        // Create Logger
        var logger = new MyLogger(config.logs.api.category, config.logs.api.path)
        logger.CreateLogger()

        if (!req.body.privatekey || !req.body.contractAddress || !req.body.toAddress || !req.body.amount) {
            var objError = Errors.ProvideRequiredParmeters
            return res.json(await utils.errorResponse(objError.message, objError.errorCode))
        }
        var contractObj = new ContractERC20(req.body.contractAddress, "./build/:DappToken.json", web3)
        let {txHash, sender, fee} = await contractObj.approve(req.body.privatekey, req.body.toAddress, req.body.amount)
        if (txHash !== null) {
            let dbParams = {
                "tx_hash" : txHash,
                "contract_address" : req.body.contractAddress,
                "from_address" : sender,
                "to_address" : req.body.toAddress,
                "token_amount" : req.body.amount,
                "confirmations" : 0,
                "block_number" : -1,
                "fee_in_wei" : fee,
                "function_name" : "approve"
            }
            return res.json(await utils.successResponse(dbParams,{"tx_hash": txHash,  "fee_in_wei" : fee }))
        }
        else {
            objError = Errors.SomeErrorOccurred
            return res.json(await utils.errorResponse(objError.message, objError.errorCode))
        }
    }
    catch(err){

        if(err instanceof customException){
            var response = await utils.errorResponse(err.message, err.extra)
        }else{
            console.log(err)
            var objError = errors.SomeErrorOccurred
            var response = await utils.errorResponse(objError.message, objError.errorCode)
        }
        logger.LogError("approve : " + err)
        res.send(response)
    }
})

app.post('/transfer-from/', async function (req, res) {
    try {

        // Create Logger
        var logger = new MyLogger(config.logs.api.category, config.logs.api.path)
        logger.CreateLogger()

        if (!req.body.privatekey || !req.body.contractAddress || !req.body.fromAddress || !req.body.toAddress || !req.body.amount) {
            var objError = Errors.ProvideRequiredParmeters
            return res.json(await utils.errorResponse(objError.message, objError.errorCode))
        }
        var contractObj = new ContractERC20(req.body.contractAddress, "./build/:DappToken.json", web3)
        let {txHash, sender, fee} = await contractObj.transferFrom(req.body.privatekey, req.body.fromAddress, req.body.toAddress, req.body.amount)
        if (txHash !== null) {
            let dbParams = {
                "tx_hash" : txHash,
                "contract_address" : req.body.contractAddress,
                "from_address" : sender,
                "from_token_address" : req.body.fromAddress,
                "to_address" : req.body.toAddress,
                "token_amount" : req.body.amount,
                "confirmations" : 0,
                "block_number" : -1,
                "fee_in_wei" : fee,
                "function_name" : "transfer-from"
            }
            return res.json(await utils.successResponse(dbParams,{"tx_hash": txHash,  "fee_in_wei" : fee }))
        }
        else {
            objError = Errors.SomeErrorOccurred
            return res.json(await utils.errorResponse(objError.message, objError.errorCode))
        }
    }
    catch(err){

        if(err instanceof customException){
            var response = await utils.errorResponse(err.message, err.extra)
        }else{
            console.log(err)
            var objError = errors.SomeErrorOccurred
            var response = await utils.errorResponse(objError.message, objError.errorCode)
        }
        logger.LogError("transfer-from : " + err)
        res.send(response)
    }
})

app.post('/compile-contract/', async function (req, res) {
    try {

        // Create Logger
        var logger = new MyLogger(config.logs.api.category, config.logs.api.path)
        logger.CreateLogger()

        if (!req.body.fileName) {
            var objError = Errors.ProvideRequiredParmeters
            return res.json(await utils.errorResponse(objError.message, objError.errorCode))
        }
        let result = await utils.compileContract(req.body.fileName)
        if (result !== null) {
            return res.json(await utils.successResponse({},{}))
        }
        else {
            objError = Errors.SomeErrorOccurred
            return res.json(await utils.errorResponse(objError.message, objError.errorCode))
        }
    }
    catch (err) {
        console.error(err)
        logger.LogError("compile-contract : " + err.stack)
        return res.json(await utils.errorResponse(err, -999))
    }
})

app.post('/get-contract-address/', async function (req, res) {
    try {

        // Create Logger
        var logger = new MyLogger(config.logs.api.category, config.logs.api.path)
        logger.CreateLogger()

        if (!req.body.txHash) {
            var objError = Errors.ProvideRequiredParmeters
            return res.json(await utils.errorResponse(objError.message, objError.errorCode))
        }
        let result = await utils.getContractAddress(req.body.txHash)
        if (result !== null) {
            return res.json(await utils.successResponse({},{"Contract Address": result}))
        }
        else {
            objError = Errors.SomeErrorOccurred
            return res.json(await utils.errorResponse(objError.message, objError.errorCode))
        }
    }
    catch (err) {
        console.error(err)
        logger.LogError("get-contract-address : " + err.stack)
        return res.json(await utils.errorResponse(err, -999))
    }
})

app.post('/deploy-contract/', async function (req, res) {
    try {

        // Create Logger
        var logger = new MyLogger(config.logs.api.category, config.logs.api.path)
        logger.CreateLogger()

        if (!req.body.privatekey || !req.body.totalSupply || !req.body.decimals || !req.body.tokenName || !req.body.tokenSymbol) {
            var objError = Errors.ProvideRequiredParmeters
            return res.json(await utils.errorResponse(objError.message, objError.errorCode))
        }
        else {
            var params = []
            let d = req.body.decimals
            let ts = web3.utils.toHex(web3.utils.toBN(req.body.totalSupply).mul(web3.utils.toBN(10 ** d)))
            let name = req.body.tokenName
            let sym = req.body.tokenSymbol
            params.push(ts)
            params.push(name)
            params.push(sym)
            params.push(d)
        }

        let {txHash, fee, contractAddress} = await utils.DeployContract(params, req.body.privatekey)
        if (txHash !== null) {
            var dbParams = {
                "tx_hash" : txHash,
                "total_supply" : req.body.totalSupply,
                "decimals" : req.body.decimals,
                "token_name" : req.body.tokenName,
                "token_symbol" : req.body.tokenSymbol,
                "token_type" : "ERC20",
                "contract_address" : contractAddress,
                "confirmations" : 0,
                "block_number" : -1,
                "fee_in_wei" : fee
            }
            return res.json(await utils.successResponse(dbParams,{"tx_hash": txHash, "contract_address" : contractAddress, "fee_in_wei" : fee}))
        }
        else {
            objError = Errors.SomeErrorOccurred
            return res.json(await utils.errorResponse(objError.message, objError.errorCode))
        }
    }
    catch (err) {
        if(err instanceof customException){
            var response = await utils.errorResponse(err.message, err.extra)
        }else{
            console.log(err)
            var objError = errors.SomeErrorOccurred
            var response = await utils.errorResponse(objError.message, objError.errorCode)
        }
        logger.LogError("broadcast_hash : " + err)
        res.send(response)
    }
})

app.post('/broadcast_hash', async function (req, res){

    try{

        // Create Logger
        var logger = new MyLogger(config.logs.api.category, config.logs.api.path)
        logger.CreateLogger()

        // Get Input Parameters
        var fromAddress = req.body.from_address
        var toAddress = req.body.to_address
        var privateKey = req.body.private_key
        var hash = req.body.hash

        // Check Require Parameters
        await utils.checkIfPresent(fromAddress, toAddress, privateKey, hash)

        // Broadcast Hash
        var transactionData = await utils.BroadcastHash(fromAddress, toAddress, privateKey, hash)

        // Response
        var response = await utils.successResponse(transactionData,transactionData)
        res.send(response)

    }
    catch(err){

        if(err instanceof customException){
            var response = await utils.errorResponse(err.message, err.extra)
        }else{
            console.log(err)
            var objError = errors.SomeErrorOccurred
            var response = await utils.errorResponse(objError.message, objError.errorCode)
        }
        logger.LogError("broadcast_hash : " + err)
        res.send(response)
    }

    
})

app.post('/verify_hash', async function (req, res){

    try{

        // Create Logger
        var logger = new MyLogger(config.logs.api.category, config.logs.api.path)
        logger.CreateLogger()

        // Get Input Parameters
        var txID = req.body.transaction_id
        var hash = req.body.hash

        // Check Require Parameters
        await utils.checkIfPresent(txID, hash)

        // Verify Hash
        var status = await utils.VerifyHash(txID, hash)

        // Response
        var response = await utils.successResponse({},{'status' : status})
        res.send(response)

    }
    catch(err){

        if(err instanceof customException){
            var response = await utils.errorResponse(err.message, err.extra)
        }else{
            console.log(err)
            var objError = errors.SomeErrorOccurred
            var response = await utils.errorResponse(objError.message, objError.errorCode)
        }
        logger.LogError("broadcast_hash : " + err)
        res.send(response)
    }

    
})

// Dynamic Contract

// Build
app.post('/contract/build', async function (req, res){

    try{

        // Create Logger
        var logger = new MyLogger(config.logs.api.category, config.logs.api.path)
        logger.CreateLogger()

        // Get Input Parameters
        var {fields, files} = await utils.ParseMultiPartFormData(req)
        var contract = files.contract
        var contractName = fields.contract_name
        var userID = fields.user_id
    
        // Check Require Parameters
        await utils.checkIfPresent(userID, contractName, contract)

        // Build Contract
        var status = await utils.BuildContract(userID, contractName, contract)

        // Response
        var response = await utils.successResponse({'contract_name' : contractName, 'build_status' : status},{'build_status' : status})
        res.send(response)

    }
    catch(err){

        if(err instanceof customException){
            var response = await utils.errorResponse(err.message, err.extra)
        }else{
            console.log(err)
            var objError = errors.SomeErrorOccurred
            var response = await utils.errorResponse(objError.message, objError.errorCode)
        }
        logger.LogError("/contract/build : " + err)
        res.send(response)
    }

})
    
// Deploy
app.post('/contract/deploy', async function (req, res) {
    try {

        // Create Logger
        var logger = new MyLogger(config.logs.api.category, config.logs.api.path)
        logger.CreateLogger()

        // Get Input Parameters
        var contractName = req.body.contract_name
        var userID = req.body.user_id
        var constructorParams = req.body.params
        var privatekey = req.body.privatekey

        // Check Require Parameters
        await utils.checkIfPresent(userID, contractName, constructorParams, privatekey)

        // Deploy Contract
        let {txHash, fee, contractAddress, sender} = await utils.DeployDynamicContract(userID, privatekey, contractName, constructorParams)
        if (txHash !== null) {
            var dbParams = {
                "from_address" : sender,
                "tx_hash" : txHash,
                "params" : constructorParams,
                "contract_address" : contractAddress,
                "confirmations" : 0,
                "block_number" : -1,
                "fee_in_wei" : fee,
                'contract_name' : contractName
            }
            return res.json(await utils.successResponse(dbParams,{"from_address" : sender, "tx_hash": txHash, "contract_address" : contractAddress, "params" : constructorParams, "fee_in_wei" : fee}))
        }
        else {
            objError = Errors.SomeErrorOccurred
            return res.json(await utils.errorResponse(objError.message, objError.errorCode))
        }
    }
    catch (err) {
        if(err instanceof customException){
            var response = await utils.errorResponse(err.message, err.extra)
        }else{
            console.log(err)
            var objError = errors.SomeErrorOccurred
            var response = await utils.errorResponse(objError.message, objError.errorCode)
        }
        logger.LogError("/contract/deploy : " + err)
        res.send(response)
    }
})

app.post('/contract/interact', async function (req, res) {
    try {

        // Create Logger
        var logger = new MyLogger(config.logs.api.category, config.logs.api.path)
        logger.CreateLogger()

        // Get Input Parameters
        var contractName = req.body.contract_name
        var userID = req.body.user_id
        var params = req.body.params
        var method = req.body.method
        var privatekey = req.body.privatekey
        var contractAddress = req.body.contract_address

        // Check Require Parameters
        await utils.checkIfPresent(userID, contractName, params, method, privatekey, contractAddress)

        // Deploy Contract
        let result = await utils.InteractDynamicContract(userID, privatekey, contractName, contractAddress, method, params)
        if (result !== null) {
            return res.json(await utils.successResponse(result,result))
        }
        else {
            objError = Errors.SomeErrorOccurred
            return res.json(await utils.errorResponse(objError.message, objError.errorCode))
        }
    }
    catch (err) {
        if(err instanceof customException){
            var response = await utils.errorResponse(err.message, err.extra)
        }else{
            console.log(err)
            var objError = errors.SomeErrorOccurred
            var response = await utils.errorResponse(objError.message, objError.errorCode)
        }
        logger.LogError("/contract/interact : " + err)
        res.send(response)
    }
})


app.post('/get_balance', async function (req, res) {
    try {

        // Create Logger
        var logger = new MyLogger(config.logs.api.category, config.logs.api.path)
        logger.CreateLogger()

        // Get Input Parameters
        var address = req.body.address
        
        // Check Require Parameters
        await utils.checkIfPresent(address)

        // Deploy Contract
        let balance_in_wei = await utils.GetETHBalance(address)
        if (balance_in_wei !== null) {
            return res.json(await utils.successResponse({},{
                'balance' : balance_in_wei / (10 ** 18)
            }))
        }
        else {
            objError = Errors.SomeErrorOccurred
            return res.json(await utils.errorResponse(objError.message, objError.errorCode))
        }
    }
    catch (err) {
        if(err instanceof customException){
            var response = await utils.errorResponse(err.message, err.extra)
        }else{
            console.log(err)
            var objError = errors.SomeErrorOccurred
            var response = await utils.errorResponse(objError.message, objError.errorCode)
        }
        logger.LogError("get_balance : " + err)
        res.send(response)
    }
})

