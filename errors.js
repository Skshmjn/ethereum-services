
function ErrorMessage(message, errorCode){
    this.message = message
    this.errorCode = errorCode
}

errors = {}
errors.ProvideRequiredParmeters = new ErrorMessage("Please provide all the required Parameters",1);
errors.SomeErrorOccurred = new ErrorMessage("Some error occurred", -1);
errors.AddressAlreadyGeneratedForPath = new ErrorMessage("Address already generated for given currency path", 3);
errors.InvalidAddress = new ErrorMessage("Invalid Address", 4);
errors.AddressDataNotFound = new ErrorMessage("Address Data Not Found", 5);
errors.InSufficientBalance = new ErrorMessage("InSufficient Balance", 6);
errors.AddressNotDefined = new ErrorMessage("Address Not Defined", 7);
errors.OutputTooSmall = new ErrorMessage("Output value is less than transaction fee", 8);
errors.TokenNotRegistered = new ErrorMessage("Token Not Registered", 9);
errors.TokenAlreadyRegistered = new ErrorMessage("Token Already Registered", 10);
errors.InSufficientTokens = new ErrorMessage("InSufficient Tokens", 11);
errors.ExceededHashLength = new ErrorMessage("Hash Length should be less than 256", 12);
errors.InvalidTransactionID = new ErrorMessage("Invalid Transaction ID", 13);
errors.TransactionNotValid = new ErrorMessage("Transaction is Not Valid", 14);
errors.KnownTransaction = new ErrorMessage("Previous Transactions are pending. Please wait for some time", 15);
errors.InvalidContract = new ErrorMessage("Invalid Contract", 16);
errors.InvalidMethod = new ErrorMessage("Invalid Smart Contract Method", 17);
errors.InvalidArguments = new ErrorMessage("Invalid Arguments", 18);
errors.DuplicateContract = new ErrorMessage("Duplicate Contract Name", 19);
errors.OnlySolFilesAreAllowed = new ErrorMessage("Only Sol Files are allowed", 20);
errors.ContractCompliationError = new ErrorMessage("Unable to compile contract due to compilation errors", 21);
errors.UnknownContract = new ErrorMessage("Unknown Contract", 22);
errors.InvalidNumberArguments = new ErrorMessage("Invalid Number of arguments", 23);

errors.ethereum = {}
errors.ethereum.known_transaction = "known transaction"
errors.ethereum.invalidTransaction = "Returned values aren't valid, did it run Out of Gas?"
errors.ethereum.replacementTransactionUnderpriced = "replacement transaction underpriced"
errors.ethereum.generic = "Returned error"
errors.ethereum.invalidFunction = "is not a function"
errors.ethereum.invalidArguments = "invalid"
errors.ethereum.invalidNumberArguments = "Invalid number of parameters"


module.exports = errors