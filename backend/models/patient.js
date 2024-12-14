'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Patient extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Patient.init({
    fullName: DataTypes.STRING,
    CNI: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    healthProblem: DataTypes.STRING,
    doctorName: DataTypes.STRING,
    city: DataTypes.STRING,
    age: DataTypes.INTEGER,
    gender: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Patient',
  });
  return Patient;
};