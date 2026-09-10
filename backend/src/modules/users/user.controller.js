const userService = require('./user.service');
const { validationResult } = require('express-validator');

class UserController {
  async getProfile(req, res) {
    try {
      const user = await userService.getUserById(req.user.userId);
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(404).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const result = await userService.updateProfile(req.user.userId, req.body);
      
      res.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: result
      });
    } catch (error) {
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  async updatePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Contraseña actual y nueva son requeridas'
        });
      }
      
      await userService.updatePassword(
        req.user.userId,
        currentPassword,
        newPassword
      );
      
      res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });
    } catch (error) {
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  async list(req, res) {
    try {
      const users = await userService.listUsers(req.query);
      
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  async getById(req, res) {
    try {
      const user = await userService.getUserById(req.params.id);
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(404).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const result = await userService.updateProfile(req.params.id, req.body);
      
      res.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: result
      });
    } catch (error) {
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  async delete(req, res) {
    try {
      await userService.deactivateUser(req.params.id);
      
      res.json({
        success: true,
        message: 'Usuario desactivado exitosamente'
      });
    } catch (error) {
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  async deactivateUser(req, res) {
    try {
      await userService.deactivateUser(req.params.id);
      
      res.json({
        success: true,
        message: 'Usuario desactivado exitosamente'
      });
    } catch (error) {
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  async activateUser(req, res) {
    try {
      await userService.activateUser(req.params.id);
      
      res.json({
        success: true,
        message: 'Usuario activado exitosamente'
      });
    } catch (error) {
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  }
}

module.exports = new UserController();