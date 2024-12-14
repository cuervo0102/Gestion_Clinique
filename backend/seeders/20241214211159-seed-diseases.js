'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Diseases', [
      { name: 'Hypertension', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Diabetes', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Asthma', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Diseases', null, {});
  },
};
