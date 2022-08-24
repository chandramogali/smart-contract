//https://eth-mainnet.g.alchemy.com/v2/W51iprnx0a6VBCvz1J6WrVxdfE6BGk8N
//ee7d111b30df8456dee52fbd9ce82cc08a0ab4a640b5a70a177c42922d9704fb
require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    rinkeby: {
      url: 'https://eth-rinkeby.alchemyapi.io/v2/tyS9QBt1cRFhYBiiI__qte1LvJVofAsF',
      accounts: ['ee7d111b30df8456dee52fbd9ce82cc08a0ab4a640b5a70a177c42922d9704fb'],
    },
  },
};