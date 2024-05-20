module.exports = {
    networks: {
      development: {
        host: "127.0.0.1",     // Localhost (default: Ganache)
        port: 7545,            // Default Ganache port
        network_id: "*",       // Any network (matching any network id)
        gas: 6721975,
        gasPrice: 20000000000,
      },
    },
    compilers: {
      solc: {
        version: "0.8.19",    // Specify compiler version
      }
    },
    contracts_directory: './src/contracts/',
    migrations_directory: './migrations/',
    contracts_build_directory: './src/abis/', // specify the path to your artifacts
  };
  