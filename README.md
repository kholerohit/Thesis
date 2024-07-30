#Scholarship Management System

This project is a Scholarship managment system based on Blockchain running on a local Ethereum network using Ganache. I implemented zero knowledge proof
 (zk-SNARK) based verification of credentials of the scholarship applicants using Zokrates for ensuring privacy of applicant credentials.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js** and **npm** installed: [Node.js Download](https://nodejs.org/)
- **Truffle** installed globally: `npm install -g truffle`
- **Ganache** installed: [Ganache Download](https://www.trufflesuite.com/ganache)
- **IPFS (Kubo)** installed: [Kubo Download](https://github.com/ipfs/kubo)
- 
## Getting Started

### Step 1: Clone the Repository

Clone the project repository to your local machine:

git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

### Step 2: Install Dependencies
Navigate to the project directory and install the necessary dependencies:

npm install

###Step 3: Start Ganache
Start Ganache to create a local Ethereum blockchain:

Open Ganache GUI.
Click on QUICKSTART to create a new workspace.
Alternatively, you can start Ganache CLI by running:

ganache-cli

###Step 4: Configure Truffle
Update the truffle-config.js file to connect to your local Ganache instance. It should look something like this:

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545, // Port where Ganache is running
      network_id: "*", // Match any network id
    },
  },
  // Other configuration settings...
};

###Step 5: Compile Contracts
Compile the smart contracts using Truffle:

truffle compile

###Step 6: Deploy Contracts
Deploy the compiled contracts to the local Ganache blockchain:

truffle migrate

###Step 7: Run Tests
Run the tests to ensure everything is working correctly:

truffle test

###Step 8: Install and Set Up Kubo (IPFS)
Install Kubo
Download and install Kubo (IPFS implementation) from the official GitHub repository:
[Kubo Download](https://github.com/ipfs/kubo)

For example, on macOS you can use Homebrew:

brew install ipfs

On Linux, you can download the binary from the releases page and follow the installation instructions provided there.

##Initialize IPFS
After installing IPFS, initialize it:

ipfs init

##Start IPFS Daemon
Start the IPFS daemon to enable communication with the IPFS network:

ipfs daemon

### For running backend , run:

cd server
npm start 

There are three roles in the system: Scholarship Provider, Student and Certificate Authority.






