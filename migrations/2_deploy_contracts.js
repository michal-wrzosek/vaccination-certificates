const VaccinationCertificates = artifacts.require("VaccinationCertificates");

module.exports = function (deployer) {
  deployer.deploy(VaccinationCertificates);
};
