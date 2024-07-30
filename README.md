# Scholarship Management System

This project is a Scholarship Management System based on Blockchain running on a local Ethereum network using Ganache. I implemented zero knowledge proof
 (zk-SNARK) based verification of credentials of the scholarship applicants using Zokrates for ensuring privacy of applicant credentials.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js** and **npm** installed: [Node.js Download](https://nodejs.org/)
- **Truffle** installed globally: `npm install -g truffle`
- **Ganache** installed: [Ganache Download](https://www.trufflesuite.com/ganache)
- **IPFS (Kubo)** installed: [Kubo Download](https://github.com/ipfs/kubo)
  
## Getting Started

### Step 1: Clone the Repository

Clone the project repository to your local machine:

git clone [https://github.com/ananya8606/PP_SMS.git](https://github.com/ananya8606/PP_SMS.git)

### Step 2: Install Dependencies
Navigate to the project directory and install the necessary dependencies:

npm install

### Step 3: Start Ganache
Start Ganache to create a local Ethereum blockchain:

Open Ganache GUI.
Click on QUICKSTART to create a new workspace.
Alternatively, you can start Ganache CLI by running:

ganache-cli

### Step 4: Configure Truffle
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

### Step 5: Compile Contracts
Compile the smart contracts using Truffle:

truffle compile

### Step 6: Deploy Contracts
Deploy the compiled contracts to the local Ganache blockchain:

truffle migrate

### Step 7: Run Tests
Run the tests to ensure everything is working correctly:

truffle test

### Step 8: Install and Set Up Kubo (IPFS)
Install Kubo
Download and install Kubo (IPFS implementation) from the official GitHub repository:
[Kubo Download](https://github.com/ipfs/kubo)

For example, on macOS you can use Homebrew:

brew install ipfs

On Linux, you can download the binary from the releases page and follow the installation instructions provided there.

### Initialize IPFS
After installing IPFS, initialize it:

ipfs init

### Start IPFS Daemon
Start the IPFS daemon to enable communication with the IPFS network:

ipfs daemon

### For running backend , run:

cd server
npm start 

There are three roles in the system: Scholarship Provider, Student and Certificate Authority.

## Signup Page
![Signup Page](https://github.com/user-attachments/assets/d72e3579-445a-4b06-b8e3-1844994aa688)

## Login Page
![Login page](https://github.com/user-attachments/assets/27b5d5ce-f693-4e00-9cbf-338c1b321d8f)

## Scholarship Provider Dashboard
![SP dashboard](https://github.com/user-attachments/assets/20322e3b-d7bb-4728-95e8-854fd6598642)

## Scholarships Added
![Added Scholarships](https://github.com/user-attachments/assets/1dc82121-474c-487d-9e3f-d4a4fb8da52b)

## Student Dashboard
![Student dashboard](https://github.com/user-attachments/assets/004e251e-a6fe-4086-a0aa-2f51e33999c4)

## Student Request Certificate Page
![Student certificate request ](https://github.com/user-attachments/assets/7d60eba8-68e1-44c9-b930-e079e4872fe9)

## Certification Authority Dashboard
![decrypted file ca dashboard](https://github.com/user-attachments/assets/6ffa2f92-0fe5-4188-8dc2-cf216e43aaef)

## Certificate generate page
![CA generate certificate](https://github.com/user-attachments/assets/09308dce-1945-4ae9-9273-5224f497719a)

## Generated Certificate
![certificate](https://github.com/user-attachments/assets/3f9013fb-bdd9-48d8-a6d3-448113d0b354)

## Student Apply Form
### 1. Zokrates compile
   ![zokrates compile](https://github.com/user-attachments/assets/c7360f01-17b1-4c2c-a8cd-f01b5a08448a)

### 2. Zokrates Setup
   ![zokrates setup](https://github.com/user-attachments/assets/53f2a57a-70f6-4cce-b9e2-10b5f72629a6)

### 3. Export Verifier
   ![export verifier](https://github.com/user-attachments/assets/7794ff3c-84e5-4eeb-9523-3db8bdb77573)

### 4. Zokrates compile witness
   #### Inputs received by Zokrates 
![input received by zokrates](https://github.com/user-attachments/assets/a6042255-729d-4cb6-be59-4e5e07e97483)

### 5. Proof generated
   ![proof generated ](https://github.com/user-attachments/assets/c57ff470-ff38-4eea-bd7a-75f4bbdfcb05)

### 6. Submit Proof
![Submit Proof](https://github.com/user-attachments/assets/a57b6b12-4587-4e2b-a7d9-d7f1047010b3)

### 7. Submit Application
   ![Submit Application](https://github.com/user-attachments/assets/651bed7b-2d9a-43b4-ad52-2a7e70afbc17)

## Applied Students
![Applied Students](https://github.com/user-attachments/assets/fa49b2c3-cf39-49d8-a0e2-de092c3656bd)

## Get proof 
![get proof sp](https://github.com/user-attachments/assets/67940dce-f32e-4680-a633-b463f2f395a9)

## Application Verification
![Validate Application](https://github.com/user-attachments/assets/24177e27-0aa6-4672-b6b5-26de1bf712cc)

## Remaining Fund Updation
![Fund remaining](https://github.com/user-attachments/assets/3d84f17f-89b3-4efc-9280-f76dcd15afe9)






 









