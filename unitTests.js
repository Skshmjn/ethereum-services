const utils = require('./utils');
const config = require('./config');
//const compiled = require('./build/:DappToken.json')
const ContractERC20 = require('./ContractERC20');
var Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider(config.provider));

async function testTransferEth() {
    let accFrom = { address: config.account1, privKey: config.privKey1 }
    let accTo = { address: config.account2, privKey: config.privKey2 }
    try {
        let tx = await utils.transferEth(accFrom, accTo, { amount: '1' })
        console.log(tx);
    }
    catch (err) {
        console.log('testTransferEth_err', err)
    }
}


async function testDeployingContract(fileName, params, privKey) {
    try {

        let tx = await utils.deployContract(fileName, params, privKey, {})
        console.log("txHash : ", tx)

    }
    catch (err) {
        console.log('testDeployContract_err', err)
    }
}



async function testDeployContract() {
    let accFrom = { address: config.account1, privKey: config.privKey1 }
    abi = compiled.interface
    bytecode = compiled.bytecode
    txHash = await testDeployingContract(JSON.parse(abi), bytecode, [web3.utils.toHex(web3.utils.toBN(10000000000).mul(web3.utils.toBN(10 ** 18))), "Dapp Token1", "DAPP1", 18], accFrom.address, accFrom.privKey)
    console.log("txHash : ", txHash)
}



async function testGetContractAddress(txHash) {
    let add = await utils.getContractAddress(txHash)
    console.log("Contract Address: ", add)
    return add

}

async function testCompileContract(fileName) {
    let res = await utils.compileContract(fileName)
    console.log(res)
}


async function testDeployedContract() {
    try {
        var contractObj = new ContractERC20('0x6ef6c842204f23797b8f30aa5762bc06a59acde6', "./build/:DappToken.json", web3)
        let bal = await contractObj.balanceOf('0xF1638221192ebeB5B423ECC984cE737e44FB1a97')
        console.log("Balance :", bal);
        let n = await contractObj.name()
        console.log("Name :", n);
        let ts = await contractObj.totalSupply()
        console.log("Total Supply :", ts);
        let s = await contractObj.symbol()
        console.log("Symbol :", s);
        let d = await contractObj.decimals()
        console.log("Decimals :", d);
        let all = await contractObj.allowance('0x00BEFBec4AA42230E88b8fF6291Aeba25a5eb887', '0xF1638221192ebeB5B423ECC984cE737e44FB1a97')
        console.log("Allowance :", all);
        // let txHash = await contractObj.transfer('99AEFD83452290F6B4CA17D9950ED6856FEE24FCCF2BE3FD30489DA9B72815B4','0xF1638221192ebeB5B423ECC984cE737e44FB1a97', 2.00115);  
        // console.log('transfer: ', txHash);  
        // let appHash = await contractObj.approve('99AEFD83452290F6B4CA17D9950ED6856FEE24FCCF2BE3FD30489DA9B72815B4',"0xF1638221192ebeB5B423ECC984cE737e44FB1a97", 1.000045875695);  
        // console.log('approve: ', appHash); 
        // let tHash = await contractObj.transferFrom('5844FA7A2A073DEB6F01C1CB2F04AFD71F62AFAC604078DA6163D4C3DEB3EF3F',"0x00BEFBec4AA42230E88b8fF6291Aeba25a5eb887", '0x97336F629584DA755A580bdba6a28fFe178FDfE6', 0.9199208032645);
        // console.log('approve: ', tHash);
    }
    catch (err) {
        console.error(err);
    }
}

// testTransferEth()
// testDeployingContract("ERC20Token",[web3.utils.toHex(web3.utils.toBN(10000000000).mul(web3.utils.toBN(10 ** 18))), "Dapp Token1", "DAPP1", 18], "99AEFD83452290F6B4CA17D9950ED6856FEE24FCCF2BE3FD30489DA9B72815B4", )
// testGetContractAddress('0x900c86db18a520d3a25e70344346ecf32b25b23097041c10e872b99bbfef6fc4')

// testDeployedContract() 
// testCompileContract("ERC20Token")
