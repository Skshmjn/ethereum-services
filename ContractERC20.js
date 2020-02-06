var utils = require('./utils');
var config = require('./config')
var bigNumber = require('bignumber.js');
var customException = require('./customException')

function ContractERC20(contractAddress, filePath, web3Instance) {
    var compiled = require(filePath)
    this.address = contractAddress
    this.abi = JSON.parse(compiled.interface)
    this.web3 = web3Instance
    this.contract = new this.web3.eth.Contract(this.abi, this.address)
}


ContractERC20.prototype.balanceOf = async function (address) {
    try {
        let decimals = await this.contract.methods.decimals().call()
        let bal = await this.contract.methods.balanceOf(address).call()
        bal = bigNumber(parseInt(this.web3.utils.toBN(bal))).div((10 ** decimals)).toString()
        return bal
    }
    catch (err) {
        console.log(err);
        return 0
    }

}

ContractERC20.prototype.freezeOf = async function (address) {
    try {
        let decimals = await this.contract.methods.decimals().call()
        let bal = await this.contract.methods.freezeOf(address).call()
        bal = bigNumber(parseInt(this.web3.utils.toBN(bal))).div((10 ** decimals)).toString()
        return bal
    }
    catch (err) {
        console.log(err);
        return 0
    }

}


ContractERC20.prototype.allowance = async function (address1, address2) {
    try {
        let decimals = await this.contract.methods.decimals().call()
        let bal = await this.contract.methods.allowance(address1, address2).call()
        bal = bigNumber(parseInt(this.web3.utils.toBN(bal._hex))).div((10 ** decimals)).toString()
        return bal
    }
    catch (err) {
        console.log(err);
        return 0
    }

}


ContractERC20.prototype.name = async function () {
    try {
        let name = await this.contract.methods.name().call()
        return name
    }
    catch (err) {
        console.log(err);
        return "NA"
    }
}

ContractERC20.prototype.totalSupply = async function () {
    try {
        let decimals = await this.contract.methods.decimals().call()
        let ts = await this.contract.methods.totalSupply().call()
        ts = bigNumber(parseInt(this.web3.utils.toBN(ts))).div((10 ** decimals)).toString()
        return ts
    }
    catch (err) {
        console.log(err);
        return 0
    }
}

ContractERC20.prototype.decimals = async function () {
    try {
        let d = await this.contract.methods.decimals().call()
        return d
    }
    catch (err) {
        console.log(err);
        return 0
    }
}


ContractERC20.prototype.symbol = async function () {
    try {
        let sym = await this.contract.methods.symbol().call()
        return sym
    }
    catch (err) {
        console.log(err);
        return "NA"
    }
}


ContractERC20.prototype.transfer = async function (privKey, address, _amount) {

    try {

        // Check if address is valid
        await utils.IsAddressValid([address])

        let pk = '0x' + privKey
        let sender = await this.web3.eth.accounts.privateKeyToAccount(pk).address;

        // Check for Insufficient Balance
        var balance = await utils.GetETHBalance(sender)
        var fee = await utils.GetERCFee()
        if (balance < fee){
            throw new customException(errors.InSufficientBalance)
        }

        let decimals = await this.contract.methods.decimals().call()
        let amount = bigNumber(parseInt(_amount * (10 ** decimals)));
        let contractData = this.contract.methods.transfer(address, this.web3.utils.toHex(amount)).encodeABI()
        let rawTx = {
            gasLimit: this.web3.utils.toHex(config.contractGasLimit),
            data: contractData,
            from: sender,
            to: this.address
        };
        txInfo = await utils.getTxInfo(sender);
        rawTx.nonce = txInfo.nonceHex;
        rawTx.gasPrice = txInfo.gasPriceHex;
        let signedTx = utils.signTx(rawTx, privKey)

        // Check Transaction By Calling
        try {
            await this.contract.methods.transfer(address, this.web3.utils.toHex(amount)).call({from: sender, nonce: txInfo.nonceHex})
        } catch (error) {
            throw new customException(errors.TransactionNotValid)
        }
        
        let txHash = await utils.submitTransaction(signedTx)

        return {txHash, sender, fee}

    } catch (error) {
        throw await utils.HandleEthereumException(error)
         
    }
}

ContractERC20.prototype.approve = async function (privKey, address, _amount) {
    try {
        let pk = '0x' + privKey
        let sender = await this.web3.eth.accounts.privateKeyToAccount(pk).address;

        // Check for Insufficient Balance
        var balance = await utils.GetETHBalance(sender)
        var fee = await utils.GetERCFee()
        if (balance < fee){
            throw new customException(errors.InSufficientBalance)
        }
        
        let decimals = await this.contract.methods.decimals().call()
        let amount = bigNumber(parseInt(_amount * (10 ** decimals)));
        let contractData = this.contract.methods.approve(address, this.web3.utils.toHex(amount)).encodeABI()
        let rawTx = {
            gasLimit: this.web3.utils.toHex(config.contractGasLimit),
            data: contractData,
            from: sender,
            to: this.address
        };
        txInfo = await utils.getTxInfo(sender);
        rawTx.nonce = txInfo.nonceHex;
        rawTx.gasPrice = txInfo.gasPriceHex;
        let signedTx = utils.signTx(rawTx, privKey)

        // Check Transaction By Calling
        try {
            await this.contract.methods.approve(address, this.web3.utils.toHex(amount)).call({from: sender, nonce: txInfo.nonceHex})
        } catch (error) {
            throw new customException(errors.TransactionNotValid)
        }
        
        let txHash = await utils.submitTransaction(signedTx)

        return {txHash, sender, fee}
    }
    catch (error) {
        throw await utils.HandleEthereumException(error)
    }
}

ContractERC20.prototype.burn = async function (privKey, _amount) {
    try {
        let pk = '0x' + privKey
        let sender = await this.web3.eth.accounts.privateKeyToAccount(pk).address;

        // Check for Insufficient Balance
        var balance = await utils.GetETHBalance(sender)
        var fee = await utils.GetERCFee()
        if (balance < fee){
            throw new customException(errors.InSufficientBalance)
        }

        let decimals = await this.contract.methods.decimals().call()
        let amount = bigNumber(parseInt(_amount * (10 ** decimals)));
        let contractData = this.contract.methods.burn(this.web3.utils.toHex(amount)).encodeABI()
        let rawTx = {
            gasLimit: this.web3.utils.toHex(config.contractGasLimit),
            data: contractData,
            from: sender,
            to: this.address
        };
        txInfo = await utils.getTxInfo(sender);
        rawTx.nonce = txInfo.nonceHex;
        rawTx.gasPrice = txInfo.gasPriceHex;
        let signedTx = utils.signTx(rawTx, privKey)


         // Check Transaction By Calling
         try {
            await this.contract.methods.burn(this.web3.utils.toHex(amount)).call({from: sender, nonce: txInfo.nonceHex})
        } catch (error) {
            throw new customException(errors.TransactionNotValid)
        }
        
        let txHash = await utils.submitTransaction(signedTx)

        return {txHash, sender, fee}
    }
    catch (error) {
        throw await utils.HandleEthereumException(error)
    }
}

ContractERC20.prototype.freeze = async function (privKey, _amount) {
    try {
        let pk = '0x' + privKey
        let sender = await this.web3.eth.accounts.privateKeyToAccount(pk).address;

        // Check for Insufficient Balance
        var balance = await utils.GetETHBalance(sender)
        var fee = await utils.GetERCFee()
        if (balance < fee){
            throw new customException(errors.InSufficientBalance)
        }

        let decimals = await this.contract.methods.decimals().call()
        let amount = bigNumber(parseInt(_amount * (10 ** decimals)));
        let contractData = this.contract.methods.freeze(this.web3.utils.toHex(amount)).encodeABI()
        let rawTx = {
            gasLimit: this.web3.utils.toHex(config.contractGasLimit),
            data: contractData,
            from: sender,
            to: this.address
        };
        txInfo = await utils.getTxInfo(sender);
        rawTx.nonce = txInfo.nonceHex;
        rawTx.gasPrice = txInfo.gasPriceHex;
        let signedTx = utils.signTx(rawTx, privKey)

        // Check Transaction By Calling
        try {
            await this.contract.methods.freeze(this.web3.utils.toHex(amount)).call({from: sender, nonce: txInfo.nonceHex})
        } catch (error) {
            throw new customException(errors.TransactionNotValid)
        }

        let txHash = await utils.submitTransaction(signedTx)
        return {txHash, sender, fee}
    }
    catch (error) {
        throw await utils.HandleEthereumException(error)
    }
}

ContractERC20.prototype.unfreeze = async function (privKey, _amount) {
    try {
        let pk = '0x' + privKey
        let sender = await this.web3.eth.accounts.privateKeyToAccount(pk).address;

        // Check for Insufficient Balance
        var balance = await utils.GetETHBalance(sender)
        var fee = await utils.GetERCFee()
        if (balance < fee){
            throw new customException(errors.InSufficientBalance)
        }


        let decimals = await this.contract.methods.decimals().call()
        let amount = bigNumber(parseInt(_amount * (10 ** decimals)));
        let contractData = this.contract.methods.unfreeze(this.web3.utils.toHex(amount)).encodeABI()
        let rawTx = {
            gasLimit: this.web3.utils.toHex(config.contractGasLimit),
            data: contractData,
            from: sender,
            to: this.address
        };
        txInfo = await utils.getTxInfo(sender);
        rawTx.nonce = txInfo.nonceHex;
        rawTx.gasPrice = txInfo.gasPriceHex;
        let signedTx = utils.signTx(rawTx, privKey)

        // Check Transaction By Calling
        try {
            await this.contract.methods.unfreeze(this.web3.utils.toHex(amount)).call({from: sender, nonce: txInfo.nonceHex})
        } catch (error) {
            throw new customException(errors.TransactionNotValid)
        }
        
        let txHash = await utils.submitTransaction(signedTx)

        return {txHash, sender, fee}
    }
    catch (error) {
        throw await utils.HandleEthereumException(error)
    }
}

ContractERC20.prototype.transferFrom = async function (privKey, address_from, address_to, _amount) {
    try {
        let pk = '0x' + privKey
        let sender = await this.web3.eth.accounts.privateKeyToAccount(pk).address;

         // Check for Insufficient Balance
         var balance = await utils.GetETHBalance(sender)
         var fee = await utils.GetERCFee()
         if (balance < fee){
             throw new customException(errors.InSufficientBalance)
         }

        let decimals = await this.contract.methods.decimals().call()
        let amount = bigNumber(parseInt(_amount * (10 ** decimals)));
        let contractData = this.contract.methods.transferFrom(address_from, address_to, this.web3.utils.toHex(amount)).encodeABI()
        let rawTx = {
            gasLimit: this.web3.utils.toHex(config.contractGasLimit),
            data: contractData,
            from: sender,
            to: this.address
        };
        txInfo = await utils.getTxInfo(sender);
        rawTx.nonce = txInfo.nonceHex;
        rawTx.gasPrice = txInfo.gasPriceHex;
        let signedTx = utils.signTx(rawTx, privKey)

        // Check Transaction By Calling
        try {
            await this.contract.methods.transferFrom(address_from, address_to, this.web3.utils.toHex(amount)).call({from: sender, nonce: txInfo.nonceHex})
        } catch (error) {
            throw new customException(errors.TransactionNotValid)
        }

        let txHash = await utils.submitTransaction(signedTx)

        return {txHash, sender, fee}
    }
    catch (error) {
        throw await utils.HandleEthereumException(error)
    }
}


module.exports = ContractERC20
