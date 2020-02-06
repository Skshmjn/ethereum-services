'use strict';


module.exports = function CustomException(error) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = error.message;
  this.extra = error.errorCode;
};

require('util').inherits(module.exports, Error);