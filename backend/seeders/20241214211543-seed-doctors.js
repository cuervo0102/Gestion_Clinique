'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Doctors', [
      { name: 'Dr. Smith', specialization: 'Cardiology', phoneNumber: '1234567890', email: 'smith@clinic.com', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Dr. Johnson', specialization: 'Endocrinology', phoneNumber: '0987654321', email: 'johnson@clinic.com', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Dr. Lee', specialization: 'Pulmonology', phoneNumber: '5678901234', email: 'lee@clinic.com', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Doctors', null, {});
  },
};
