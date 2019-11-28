const HDWalletProvider = require('truffle-hdwallet-provider');
const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {
  /**
   * $ truffle test --network <network-name>
   */

  networks: {
    development: {
      provider: () => new HDWalletProvider(mnemonic, 'https://ropsten.rpc.fiews.io/v1/free'),
      network_id: "3",
      from:'0x25EaD3e55861e2622d54726884013FCb6eF182fB'
    }
  }
}
