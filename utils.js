var Tx = require('ethereumjs-tx');
var config = require('./config')
const Web3 = require('web3')
const contract = require('web3-eth-contract');
// const Utils = require('web3-utils');
const path = require("path");
const solc = require("solc");
const fs = require("fs-extra");
var customException = require('./customException')
const web3 = new Web3(new Web3.providers.HttpProvider(config.provider));
const Errors = require("./errors")
var mongo = require("./mongo")
var tables = require("./tables")
const formidable = require('formidable')

function ErrorMessage(message, errorCode){
    this.message = message
    this.errorCode = errorCode
}

async function successResponse(databaseParams, userParams) {

    result = {}
    result['success'] = true
    result['message'] = "Success"
    result['result'] = {}
    result['result']['database'] = databaseParams
    result['result']['user'] = userParams
    return result
  
}
  
async function errorResponse(message, code) {
  
    result = {}
    result['success'] = false
    result['error'] = message
    result['error_code'] = code
    result['result'] = {
      "user" : {
        "error" : message,
        "error_code" : code
      }
    }
    return result
  
} 

async function checkIfPresent(...args) {
  var result = args.every(isPresent)

  if (result == false) {
    throw new customException(errors.ProvideRequiredParmeters)
  }

}

function isPresent(value) {
    return !(value == null || value == '' || value == undefined)
}


var convPriv = (privKey) => {
    return Buffer.from(privKey, 'hex')
}

var signTx = (rawTxObject, privKey) => {
    try {
        let tx = new Tx(rawTxObject);
        tx.sign(convPriv(privKey));
        let serializedTx = tx.serialize();
        var signedTx = "0x" + serializedTx.toString('hex');
        return signedTx
    } catch (err) {
        console.log('signTx_error')
        throw err
    }
}

var submitTransaction = function (signedTx) {
    return new Promise((resolve, reject) => {
        web3.eth.sendSignedTransaction(signedTx, (err, txHash) => {
            if (err) {
                console.log('submitTransaction_error');
                return reject(err)
            }
            else return resolve(txHash)
        })
    })
}

var getTxInfo = async (acc) => {
    try {
        let nonce = await web3.eth.getTransactionCount(acc)
        let gasPrice = await web3.eth.getGasPrice()
        if (!gasPrice) throw Error('Gas Price issue')
        return { gasPriceHex: web3.utils.toHex(gasPrice), nonceHex: web3.utils.toHex(nonce), gasPrice: gasPrice, nonce: nonce }
    } catch (err) {
        console.log('getTxInfo_error')
        throw err
    }
}

var DeployContract = async function (params, privKey, opt = {}) {
    try {
        let compiled = require('./build/:DappToken.json')
        abi = compiled.interface
        bytecode = compiled.bytecode
        let pk = '0x' + privKey
        let sender = await web3.eth.accounts.privateKeyToAccount(pk).address;

        // Get Data
        var balance = await GetETHBalance(sender)
        var fee = await GetFee()
    
        // Check for insufficent Balance
        if (balance < fee){
            throw new customException(errors.InSufficientBalance)
        }

        let contractData = null
        if (abi && bytecode) {
            var generic_contract = new contract(JSON.parse(abi));
            contractData = generic_contract.deploy({
                data: '0x' + bytecode,
                arguments: params
            }).encodeABI();
        }
        else if (opt.contractHex) {
            contractData = opt.contractHex
        }
        else {
            throw Error('No Contract found')
        }
        let rawTxObject = {
            gasLimit: web3.utils.toHex(config.contractGasLimit),
            data: contractData,
            from: sender,
            chainId: config.chainId,
        };
        txInfo = await getTxInfo(sender);
        if (opt.gasPrice) {
            rawTxObject.gasPrice = opt.gasPrice
            rawTxObject.nonce = txInfo.nonceHex;
        }
        else {
            rawTxObject.nonce = txInfo.nonceHex;
            rawTxObject.gasPrice = txInfo.gasPriceHex;
        }
        let signedTx = signTx(rawTxObject, privKey)
        let transactionReceipt = await web3.eth.sendSignedTransaction(signedTx)

        let txHash = transactionReceipt["transactionHash"]
        let contractAddress = transactionReceipt["contractAddress"]

        return {txHash,fee,contractAddress}

    } catch (err) {
        throw await HandleEthereumException(err)
        
    }
}

var transferEth = async function (accFrom, accTo, opt) {
    try {
        let rawTxObject = {
            to: accTo.address,
            gasLimit: web3.utils.toHex(config.TxGasLimit),
            from: accFrom.address,
            chainId: config.chainId,
            value: web3.utils.toHex(web3.utils.toWei(opt.amount, 'ether'))
        };
        txInfo = await getTxInfo(accFrom.address);
        if (opt.gasPrice) {
            rawTxObject.gasPrice = opt.gasPrice
            rawTxObject.nonce = txInfo.nonceHex;
        }
        else {
            rawTxObject.nonce = txInfo.nonceHex;
            rawTxObject.gasPrice = txInfo.gasPriceHex;
        }
        let signedTx = await signTx(rawTxObject, accFrom.privKey)
        let txHash = await submitTransaction(signedTx)
        return txHash
    } catch (err) {
        console.error('transferEth_error');
        throw err
    }
}


var getContractAddress = async function (txHash) {
    try {
        const receipt = await web3.eth.getTransactionReceipt(txHash)
        let address = receipt.contractAddress
        return address
    }
    catch (err) {
        console.error('getContractAddress_err');
        throw err
    }
}

var compileContract = async function (fileName) {
    let files = { "ERC20Token": "DappToken.sol", "SecurityToken": "SecToken.sol" }
    try {
        let filename = files[fileName]

        const buildPath = path.resolve(__dirname, "build");
        const filePath = path.resolve(
            __dirname,
            "contracts",
            filename
        );
        const source = fs.readFileSync(filePath, "utf-8");

        const output = solc.compile(source, 1).contracts;

        fs.ensureDirSync(buildPath);

        for (let contract in output) {
            fs.outputJsonSync(

                path.resolve(buildPath, contract + ".json"),
                output[contract]
            );
        }
        return true
    }
    catch (err) {

        console.error("compile_contract_err");
        throw err;

    }

}

async function IsAddressValid(addresses){

    addresses.forEach(address => {
      // Check if Address is valid
      var isAddressValid = web3.utils.isAddress(address)
  
      if (isAddressValid == false){
        throw new customException(errors.InvalidAddress)
      }
    });
  
}

async function GetFee() {

    // Get Fee
    var gasPrice = await web3.eth.getGasPrice()
    var fee = (config.TxGasLimit * gasPrice)

    return fee
}

async function GetERCFee() {

    // Get Fee
    var gasPrice = await web3.eth.getGasPrice()
    var fee = (config.contractGasLimit * gasPrice)

    return fee
}

async function GetETHBalance(address) {
  
    // Check if Address is valid
    await IsAddressValid([address])
  
    // Get Balance
    var balance = await web3.eth.getBalance(address)
  
    return balance
  
  }

async function CreateRawBrodcastTransaction(fromAddress, toAddress, hash){

    var nonce = await web3.eth.getTransactionCount(fromAddress)
    nonce = web3.utils.toHex(nonce)

    let rawTxObject = {
        from : web3.utils.toChecksumAddress(fromAddress),
        to : web3.utils.toChecksumAddress(toAddress),
        value : 0,
        gasLimit : web3.utils.toHex(config.TxGasLimit),
        gasPrice: web3.utils.toHex(await web3.eth.getGasPrice()),
        nonce : web3.utils.toHex(nonce),
        chainId : config.chainId,
        data : hash
    }

    return rawTxObject
}
  

async function BroadcastHash(fromAddress, toAddress, privateKey, hash) {

    try {

        // Check if hash length is less than 256
        if (hash.length > 255){
            throw new customException(errors.ExceededHashLength) 
        }

        // Check if address is valid
        await IsAddressValid([fromAddress, toAddress])
    
        // Get Data
        var balance = await GetETHBalance(fromAddress)
        var fee = await GetFee()
    
        // Check for insufficent Balance
        if (balance < fee){
        throw new customException(errors.InSufficientBalance)
        }
    
        // Create Raw Transaction
        var rawTransaction = await CreateRawBrodcastTransaction(fromAddress, toAddress, hash)
    
        // Sign Transaction
        var signedTransaction = await signTx(rawTransaction, privateKey)
    
        // Send Transaction    
        var txHash = await submitTransaction(signedTransaction)
        
    
        // Insert in Transaction Table
        var transactionData = {
        'from_address': fromAddress,
        'to_address': toAddress,
        'tx_hash': txHash,
        'confirmations': 0,
        'block_number': -1,
        'fee_in_wei': fee
        }

    
        return transactionData

    } catch (error) {
        throw await HandleEthereumException(error)
    }
}

async function VerifyHash(txID, hash) {
    try {
        // Get Transaction Data
        let transactionData = await web3.eth.getTransaction(txID)
        var txHashData = transactionData["input"]

        // Validate Hash
        var status = (web3.utils.toHex(hash) == txHashData)

        return status
        
    } catch (error) {
        throw new customException(errors.InvalidTransactionID)
    }
    
    
}

async function BuildContract(userID, contractName, contractFile){

    // Only Sol Files
    if (contractFile.name.endsWith(".sol") == false){
        throw new customException(Errors.OnlySolFilesAreAllowed)
    }

    // Check if Same UserID and Contract Name Already Build
    var db = mongo.getDB()
    var contractDataDB = await db.collection(tables.build_contracts).findOne({
        'user_id': userID,
        'contract_name': contractName
    })
    if (contractDataDB != null) {
        throw new customException(Errors.DuplicateContract)
    }

    // Build
    const buildPath = path.resolve("user_build");
    const source = fs.readFileSync(contractFile.path, "utf-8");
    const output = solc.compile(source, 1).contracts;

    // Check if contract complied successfully
    if ((Object.entries(output).length === 0 && output.constructor === Object) == true){
        throw new customException(Errors.ContractCompliationError)
    }
    
    // Save
    fs.ensureDirSync(buildPath);
    let finalBuildPath = path.resolve(buildPath, userID + "_" + contractName + ".json")
    for (let contract in output) {
        fs.outputJsonSync(
            finalBuildPath,
            output[contract]
        );
    }

    // Insert in DB - UserID, ContractName, BuildPath
    let contractData = {
        'user_id': userID,
        'contract_name': contractName,
        'build_path' : finalBuildPath
    }
    db.collection(tables.build_contracts).insertOne(contractData, function (err, res) {
        if (err) throw err;
    });

    return true

}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
}

async function GetContractConstructorArguments(contractObj, inputParams){

    // Check if parameters Name Match
    var requiredConstructorObj  = contractObj._jsonInterface.filter(x => x.type == 'constructor')
    var requiredConstructorParams = requiredConstructorObj[0].inputs.map(x => x.name)
    var requiredConstructorParamsTypes = requiredConstructorObj[0].inputs.map(x => x.name + " : " + x.type)
    var checkConstructorKeys = requiredConstructorParams.slice()
    var inputParamKeys = Object.keys(inputParams)
    checkConstructorKeys.sort()
    inputParamKeys.sort()
    if (inputParamKeys.toString() != checkConstructorKeys.toString()){
        throw new customException(new ErrorMessage("Incorrect Parameters. Suggested Parameters : " + requiredConstructorParamsTypes.toString(), 99))
    }

    // Get Constructor Arguments in list
    var finalConstructorParams = []
    const constructParams = async () => {
        await asyncForEach(requiredConstructorParams, async (param) => {
            finalConstructorParams.push(inputParams[param])
        });
    }
    await constructParams();

    return finalConstructorParams

}

async function DeployDynamicContract(userID, privatekey, contractName, constructorParams, opt = {}){

   
    try {

        // Check if Contract Exist
        var db = mongo.getDB()
        var contractDataDB = await db.collection(tables.build_contracts).findOne({
            'user_id': userID,
            'contract_name': contractName
        })
        if (contractDataDB == null) {
            throw new customException(Errors.UnknownContract)
        }

        // Get Complied Path
        let compiledPath = contractDataDB.build_path

        // Deploy Contract
        let compiled = require(compiledPath)
        abi = compiled.interface
        bytecode = compiled.bytecode
        let pk = '0x' + privatekey
        let sender = await web3.eth.accounts.privateKeyToAccount(pk).address;

        // Get Address Data
        var balance = await GetETHBalance(sender)
        var fee = await GetFee()

        // Check for insufficent Balance
        if (balance < fee){
            throw new customException(errors.InSufficientBalance)
        }

        // Compile Contract
        let contractData = null
        if (abi && bytecode) {
            var contractObj = new contract(JSON.parse(abi));
            constructorParams = await GetContractConstructorArguments(contractObj, constructorParams)
            contractData = contractObj.deploy({
                data: '0x' + bytecode,
                arguments: constructorParams
            }).encodeABI();
        }
        else if (opt.contractHex) {
            contractData = opt.contractHex
        }

        // Raw Transaction
        let rawTxObject = {
            gasLimit: web3.utils.toHex(config.contractGasLimit),
            data: contractData,
            from: sender,
            chainId: config.chainId,
        };

        // Get Transaction Info
        txInfo = await getTxInfo(sender);
        if (opt.gasPrice) {
            rawTxObject.gasPrice = opt.gasPrice
            rawTxObject.nonce = txInfo.nonceHex;
        }
        else {
            rawTxObject.nonce = txInfo.nonceHex;
            rawTxObject.gasPrice = txInfo.gasPriceHex;
        }

        // Sign Transaction
        let signedTx = signTx(rawTxObject, privatekey)

        // Broadcast Transaction
        let transactionReceipt = await web3.eth.sendSignedTransaction(signedTx)

        let txHash = transactionReceipt["transactionHash"]
        let contractAddress = transactionReceipt["contractAddress"]

        return {txHash,fee,contractAddress, sender}

        
    } catch (error) {
        if(error instanceof customException){
            throw error
        }else{
            throw await HandleEthereumException(error)
        }
    }
        
    
}

async function HandleContractMethod(contractObj, method, inputParams, sender, nonce, contractAddress, privatekey, txInfo, fee, contractName){


    // Check if parameters Name Match
    var requiredMethodObj  = contractObj._jsonInterface.filter(x => x.name == method, type="function")
    
    // Check if function Exists
    if (requiredMethodObj.length == 0){
        let suggestedMethods = contractObj._jsonInterface.map(x => x.name).toString()
        throw new customException(new ErrorMessage("Method not found, Suggested Methods => " + suggestedMethods, 101))
    }

    // Check if its a Public View function
    var isViewFunction = false
    if (requiredMethodObj[0].stateMutability == "view"){
        isViewFunction = true
    }

    var requiredMethodParams = requiredMethodObj[0].inputs.map(x => x.name)
    var requiredMethodParamsTypes = requiredMethodObj[0].inputs.map(x => x.name + " : " + x.type)
    var finalConstructorParams = []

    // Handle Variable Name Not Present in View Function
    if (requiredMethodParams[0] == ""){
        requiredMethodParams = requiredMethodObj[0].inputs.map(x => x.type)
        requiredMethodParamsTypes = requiredMethodParams

        // Construct Params
        var inputParamKeys = Object.keys(inputParams)
        const constructParams = async () => {
            await asyncForEach(inputParamKeys, async (key) => {
                finalConstructorParams.push(inputParams[key])
            });
        }
        await constructParams();

    }else{
        var checkMethodKeys = requiredMethodParams.slice()
        var inputParamKeys = Object.keys(inputParams)
        checkMethodKeys.sort()
        inputParamKeys.sort()
        if (inputParamKeys.toString() != checkMethodKeys.toString()){
            throw new customException(new ErrorMessage("Incorrect Parameters. Suggested Parameters => " + requiredMethodParamsTypes.toString(), 99))
        }

        // Construct Params
        const constructParams = async () => {
            await asyncForEach(requiredMethodParams, async (param) => {
                finalConstructorParams.push(inputParams[param])
            });
        }
        await constructParams();
    }

    // Call to check transcation Validity and Check Type
    await contractObj.methods[method](...finalConstructorParams).call({from: sender, nonce: nonce})

    // Call Function
    var result = {}
    if (isViewFunction){
        let data = await contractObj.methods[method](...finalConstructorParams).call()
        result = {
            'function_name' : method, 
            'result' : data,
            'from_address' : sender,
            'is_view' : isViewFunction,
            "contract_name" : contractName,
        }
    }else{

        var contractData = await contractObj.methods[method](...finalConstructorParams).encodeABI()

        // Raw Transaction
        let rawTx = {
            gasLimit: web3.utils.toHex(config.contractGasLimit),
            data: contractData,
            from: sender,
            to: contractAddress,
            nonce : txInfo.nonceHex,
            gasPrice : txInfo.gasPriceHex
        };

        
        // Sign Transaction
        let signedTx = signTx(rawTx, privatekey)

        // Broadcast Transaction
        let txHash = await submitTransaction(signedTx)

        result = {
            'function_name' : method,
            'from_address' : sender,
            'is_view' : isViewFunction,
            "tx_hash" : txHash,
            "params" : inputParams,
            "contract_address" : contractAddress,
            "contract_name" : contractName,
            "confirmations" : 0,
            "block_number" : -1,
            "fee_in_wei" : fee
        }
    }
    
    return result

}


async function InteractDynamicContract(userID, privatekey, contractName, contractAddress, method, params){

   
    try {

        // Check if Contract Exist
        var db = mongo.getDB()
        var contractDataDB = await db.collection(tables.build_contracts).findOne({
            'user_id': userID,
            'contract_name': contractName
        })
        if (contractDataDB == null) {
            throw new customException(Errors.UnknownContract)
        }

        // Get Complied Path
        let compiledPath = contractDataDB.build_path

        // Get Sender
        let pk = '0x' + privatekey
        let sender = await web3.eth.accounts.privateKeyToAccount(pk).address;

        // Get Address Data
        var balance = await GetETHBalance(sender)
        var fee = await GetFee()

        // Check for insufficent Balance
        if (balance < fee){
            throw new customException(errors.InSufficientBalance)
        }

        // Create Contract Object
        var contractPathObj = require(compiledPath)
        var abi = JSON.parse(contractPathObj.interface)
        var contractObj = new this.web3.eth.Contract(abi, contractAddress)

        // Get Transaction Info
        var txInfo = await getTxInfo(sender);

        // TODO - Create Contract Data
        let result = await HandleContractMethod(contractObj, method, params, sender, txInfo.nonce, contractAddress, privatekey, txInfo, fee, contractName)

        return result

        
    } catch (error) {
        if(error instanceof customException){
            throw error
        }else{
            throw await HandleEthereumException(error)
        }
    }
        
    
}

async function HandleEthereumException(error){

    // For Duplicate Transaction
    if((error.message).indexOf(Errors.ethereum.known_transaction) > -1) {
        return new customException(Errors.KnownTransaction)
    }

    // Invalid Contract
    if((error.message).indexOf(Errors.ethereum.invalidTransaction) > -1) {
        return new customException(Errors.TransactionNotValid)
    }

    // Duplicate Transaction
    if((error.message).indexOf(Errors.ethereum.replacementTransactionUnderpriced) > -1) {
        return new customException(Errors.KnownTransaction)
    }

    // Invalid Method
    if((error.message).indexOf(Errors.ethereum.invalidFunction) > -1) {
        return new customException(Errors.InvalidMethod)
    }

    // Invalid Number of Arguents
    if((error.message).indexOf(Errors.ethereum.invalidNumberArguments) > -1) {
        return new customException(new ErrorMessage(error.message, 100))
    }

    // Invalid Type of Arguents
    if((error.message).indexOf(Errors.ethereum.invalidArguments) > -1) {
        return new customException(new ErrorMessage(error.message, 100))
    }

    // Call Error
    if((error.message).indexOf(Errors.ethereum.generic) > -1) {
        return new customException(Errors.TransactionNotValid)
    }

    return error

}

var ParseMultiPartFormData = function (request) {
    return new Promise((resolve, reject) => {
        new formidable.IncomingForm().parse(request, (err, fields, files) => {
            if (err) {
                throw err
              }
            else return resolve({fields, files})
        })
    })
}

module.exports = {
    signTx,
    submitTransaction,
    GetERCFee,
    GetETHBalance,
    IsAddressValid,
    getTxInfo, 
    DeployContract, 
    transferEth, 
    web3, 
    getContractAddress, 
    compileContract,
    successResponse,
    errorResponse,
    checkIfPresent,
    BroadcastHash,
    VerifyHash,
    HandleEthereumException,
    BuildContract,
    ParseMultiPartFormData,
    DeployDynamicContract,
    InteractDynamicContract
}