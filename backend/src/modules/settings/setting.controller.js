const SettingService = require('./setting.service');

class SettingController {
  async getDeadline(req, res) {
    try {
      const deadline = await SettingService.getDataSubmissionDeadline();
      
      res.json({
        success: true,
        data: deadline
      });
    } catch (error) {
      console.error('Error al obtener fecha límite:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async setDeadline(req, res) {
    try {
      const { deadline } = req.body;
      
      if (!deadline) {
        return res.status(400).json({
          success: false,
          error: 'La fecha límite es requerida'
        });
      }
      
      const result = await SettingService.setDataSubmissionDeadline(
        deadline,
        req.user.userId
      );
      
      res.json({
        success: true,
        message: 'Fecha límite actualizada exitosamente',
        data: result
      });
    } catch (error) {
      console.error('Error al establecer fecha límite:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async removeDeadline(req, res) {
    try {
      const result = await SettingService.removeDataSubmissionDeadline(
        req.user.userId
      );
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error al eliminar fecha límite:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async getAllSettings(req, res) {
    try {
      const settings = await SettingService.getAllSettings();
      
      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Error al obtener configuraciones:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new SettingController();