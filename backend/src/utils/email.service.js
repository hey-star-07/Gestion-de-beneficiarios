const nodemailer = require('nodemailer');
const authConfig = require('../config/auth');
const logger = require('./logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: authConfig.email.host,
      port: authConfig.email.port,
      secure: authConfig.email.port === 465,
      auth: {
        user: authConfig.email.user,
        pass: authConfig.email.pass
      }
    });
  }

  async sendVerificationEmail(email, code) {
    const mailOptions = {
      from: `"Gestión de Beneficiarios" <${authConfig.email.from}>`,
      to: email,
      subject: 'Verifica tu cuenta',
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; background-color: #fafafa;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 40px;">
              <div style="display: inline-block; width: 60px; height: 60px; background-color: #0091ff; border-radius: 50%; line-height: 60px; text-align: center; margin-bottom: 20px;">
                <span style="color: #ffffff; font-size: 24px; font-weight: 300;">GB</span>
              </div>
              <h1 style="color: #1a1a1a; font-size: 28px; font-weight: 300; margin: 0 0 10px 0; letter-spacing: -0.5px;">Verifica tu cuenta</h1>
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0;">Gracias por registrarte en nuestro sistema</p>
            </div>

            <!-- Card principal -->
            <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
              <p style="color: #1a1a1a; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Tu código de verificación es:
              </p>
              
              <!-- Código -->
              <div style="text-align: center; margin: 30px 0;">
                <span style="display: inline-block; background-color: #f0f7ff; border: 1px solid #0091ff; color: #0091ff; font-size: 36px; font-weight: 500; letter-spacing: 8px; padding: 20px 40px; border-radius: 4px;">
                  ${code}
                </span>
              </div>
              
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0; text-align: center;">
                Este código expirará en <strong>15 minutos</strong>
              </p>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 40px;">
              <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 0;">
                Si no creaste esta cuenta, puedes ignorar este email.<br>
                © 2024 Gestión de Beneficiarios. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info('Email de verificación enviado', { email });
      return true;
    } catch (error) {
      logger.error('Error enviando email de verificación', { email, error: error.message });
      return false;
    }
  }

  async sendPasswordResetEmail(email, code) {
    const mailOptions = {
      from: `"Gestión de Beneficiarios" <${authConfig.email.from}>`,
      to: email,
      subject: 'Restablecer contraseña',
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; background-color: #fafafa;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 40px;">
              <div style="display: inline-block; width: 60px; height: 60px; background-color: #ff6b00; border-radius: 50%; line-height: 60px; text-align: center; margin-bottom: 20px;">
                <span style="color: #ffffff; font-size: 24px; font-weight: 300;">GB</span>
              </div>
              <h1 style="color: #1a1a1a; font-size: 28px; font-weight: 300; margin: 0 0 10px 0; letter-spacing: -0.5px;">Restablecer contraseña</h1>
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0;">Has solicitado restablecer tu contraseña</p>
            </div>

            <!-- Card principal -->
            <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); text-align: center;">
              <p style="color: #1a1a1a; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Utiliza el siguiente código para restablecer tu contraseña:
              </p>
              
              <!-- Código -->
              <div style="text-align: center; margin: 30px 0;">
                <span style="display: inline-block; background-color: #fff5f0; border: 1px solid #ff6b00; color: #ff6b00; font-size: 36px; font-weight: 500; letter-spacing: 8px; padding: 20px 40px; border-radius: 4px;">
                  ${code}
                </span>
              </div>
              
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                Este código expirará en <strong>15 minutos</strong>
                Revisa tu <strong>carpeta de spam</strong> si no lo encuentras en tu bandeja de entrada.
              </p>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 40px;">
              <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 0;">
                Si no solicitaste este cambio, puedes ignorar este email.<br>
                © 2026 Gestión de Beneficiarios. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info('Email de restablecimiento enviado', { email });
      return true;
    } catch (error) {
      logger.error('Error enviando email de restablecimiento', { email, error: error.message });
      return false;
    }
  }
}

module.exports = new EmailService();