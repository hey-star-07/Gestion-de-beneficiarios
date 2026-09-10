const BeneficiaryModel = require('./beneficiary.model');

class BeneficiaryService {
  async listBeneficiaries(filters) {
    return await BeneficiaryModel.list(filters);
  }

  async getBeneficiaryById(id) {
    const beneficiary = await BeneficiaryModel.findById(id);
    
    if (!beneficiary) {
      throw new Error('Beneficiario no encontrado');
    }
    
    return beneficiary;
  }

  async getBeneficiaryByCode(code) {
    const beneficiary = await BeneficiaryModel.findByCode(code);
    
    if (!beneficiary) {
      throw new Error('Beneficiario no encontrado');
    }
    
    return beneficiary;
  }

  async getCompleteProfile(beneficiaryId) {
    const profile = await BeneficiaryModel.getCompleteProfile(beneficiaryId);
    
    if (!profile) {
      throw new Error('Beneficiario no encontrado');
    }
    
    return profile;
  }

  async createBeneficiary(beneficiaryData) {
    // Generar código si no existe
    if (!beneficiaryData.code) {
      beneficiaryData.code = await this.generateCode();
    }
    
    return await BeneficiaryModel.create(beneficiaryData);
  }

  async updateBeneficiary(id, beneficiaryData) {
    const beneficiary = await BeneficiaryModel.findById(id);
    
    if (!beneficiary) {
      throw new Error('Beneficiario no encontrado');
    }
    
    const updated = await BeneficiaryModel.update(id, beneficiaryData);
    
    // Devolver el perfil completo actualizado
    return await BeneficiaryModel.getCompleteProfile(id);
  }

  async deleteBeneficiary(id) {
    const beneficiary = await BeneficiaryModel.findById(id);
    
    if (!beneficiary) {
      throw new Error('Beneficiario no encontrado');
    }
    
    await BeneficiaryModel.delete(id);
  }

  async addEducationProfile(beneficiaryId, educationData) {
    const beneficiary = await BeneficiaryModel.findById(beneficiaryId);
    
    if (!beneficiary) {
      throw new Error('Beneficiario no encontrado');
    }
    
    educationData.beneficiaryId = beneficiaryId;
    return await BeneficiaryModel.addEducationProfile(educationData);
  }

  async addFamilyMember(beneficiaryId, familyData) {
    const beneficiary = await BeneficiaryModel.findById(beneficiaryId);
    
    if (!beneficiary) {
      throw new Error('Beneficiario no encontrado');
    }
    
    familyData.beneficiaryId = beneficiaryId;
    return await BeneficiaryModel.addFamilyMember(familyData);
  }

  async generateCode() {
    const db = require('../../config/database');
    const year = new Date().getFullYear();
    
    const result = await db.query(
      'SELECT COUNT(*) FROM beneficiaries WHERE code LIKE $1',
      [`${year}%`]
    );
    
    const count = parseInt(result.rows[0].count) + 1;
    return `${year}${String(count).padStart(3, '0')}`;
  }
}

module.exports = new BeneficiaryService();