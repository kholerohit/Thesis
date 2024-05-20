const ScholarshipFilter = artifacts.require("ScholarshipFilter");
const Scholarship = artifacts.require("Scholarship");

module.exports = async function (deployer) {
  await deployer.deploy(ScholarshipFilter);
  const scholarshipFilterInstance = await ScholarshipFilter.deployed();
  await deployer.deploy(Scholarship, scholarshipFilterInstance.address);
};
