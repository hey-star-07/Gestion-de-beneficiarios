const fs = require('fs');
const path = require('path');

// Crear directorio de logs si no existe
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

class Logger {
  constructor() {
    this.logFile = path.join(logDir, `${new Date().toISOString().split('T')[0]}.log`);
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] [${level}] ${message}`;
    
    if (data) {
      if (data instanceof Error) {
        logMessage += `\nError: ${data.message}`;
        if (data.stack) {
          logMessage += `\nStack: ${data.stack}`;
        }
      } else {
        logMessage += `\nData: ${JSON.stringify(data, null, 2)}`;
      }
    }
    
    return logMessage;
  }

  info(message, data = null) {
    const logMessage = this.formatMessage('INFO', message, data);
    if (!this.isProduction) {
      console.log(logMessage);
    }
    this.writeToFile(logMessage);
  }

  warn(message, data = null) {
    const logMessage = this.formatMessage('WARN', message, data);
    if (!this.isProduction) {
      console.warn(logMessage);
    }
    this.writeToFile(logMessage);
  }

  error(message, data = null) {
    const logMessage = this.formatMessage('ERROR', message, data);
    console.error(logMessage);
    this.writeToFile(logMessage);
  }

  debug(message, data = null) {
    if (!this.isProduction) {
      const logMessage = this.formatMessage('DEBUG', message, data);
      console.log(logMessage);
      this.writeToFile(logMessage);
    }
  }

  writeToFile(message) {
    try {
      fs.appendFileSync(this.logFile, message + '\n');
    } catch (err) {
      console.error('Error escribiendo en archivo de log:', err);
    }
  }

  // Método para rotar logs (llamar diariamente)
  rotateLogFile() {
    const date = new Date().toISOString().split('T')[0];
    this.logFile = path.join(logDir, `${date}.log`);
  }
}

module.exports = new Logger();