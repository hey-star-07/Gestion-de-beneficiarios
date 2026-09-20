const fs = require('fs');
const path = require('path');

// En Vercel el filesystem es de solo lectura (salvo /tmp) — intentar
// crear/escribir carpetas ahí tira la función entera con un ENOENT
// antes de que corra cualquier otra cosa (es justo lo que estaba
// pasando: hasta /health devolvía 500 por esto). process.env.VERCEL lo
// pone la plataforma sola, así que con ese flag esta clase cae a
// solo-consola ahí, y sigue escribiendo a disco normal en Render/local,
// donde sí hay un filesystem persistente.
const isServerless = Boolean(process.env.VERCEL);

const logDir = path.join(__dirname, '../../logs');
if (!isServerless && !fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

class Logger {
  constructor() {
    this.logFile = isServerless ? null : path.join(logDir, `${new Date().toISOString().split('T')[0]}.log`);
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
    // Antes esto se suprimía en producción (solo escribía al archivo).
    // Como el archivo no se ve en ningún dashboard de Render/Vercel,
    // en producción esto no producía NINGÚN rastro visible. Ahora
    // siempre sale por consola, que es lo que ambas plataformas capturan.
    const logMessage = this.formatMessage('INFO', message, data);
    console.log(logMessage);
    this.writeToFile(logMessage);
  }

  warn(message, data = null) {
    const logMessage = this.formatMessage('WARN', message, data);
    console.warn(logMessage);
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
    // En Vercel no hay archivo al que escribir — los console.log ya
    // quedan capturados en el dashboard de Logs de Vercel, que cumple
    // el mismo propósito.
    if (isServerless) return;

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