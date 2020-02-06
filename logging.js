const winston = require("winston")

const { splat, combine, timestamp, printf } = winston.format;

// meta param is ensured by splat()
const myFormat = printf(({ timestamp, level, message, meta }) => {
  return `${timestamp} | ${level} | ${message}`;
});

function MyLogger(category, logPath){
    this.category = category
    this.logPath = logPath
}

MyLogger.prototype.CreateLogger = function() {

    var finalLogPath = this.logPath + new Date().toISOString().split('T')[0]

    this.logger = winston.createLogger({
        level: 'info',
        format: combine(
            timestamp(),
            splat(),
            myFormat
          ),
        defaultMeta: "",
        transports: [
            new winston.transports.File({ filename: finalLogPath })
        ]
    });
            
}

MyLogger.prototype.LogMessage = async function(msg) {
    this.logger.info("==============================================================")
    this.logger.info(msg)
    this.logger.info("==============================================================")
}


MyLogger.prototype.LogError = async function(error) {
    this.logger.error("==============================================================")
    this.logger.error(error)
    this.logger.error("==============================================================")
}

module.exports = MyLogger