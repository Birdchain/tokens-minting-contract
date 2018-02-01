const BirdCoinCrowdsale = artifacts.require("./BirdCoinCrowdsale.sol");

module.exports = function(deployer) {
  deployer.deploy(BirdCoinCrowdsale);
};
