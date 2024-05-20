import React, { useState, useEffect, useMemo } from 'react';
import Web3 from 'web3';
import CertificateContract from '../abis/CertificateContract.json';
import './CertificateAuthority.css';
import AuthContract from '../abis/Auth.json';
import { KEYUTIL, KJUR } from 'jsrsasign';
import { JSEncrypt } from 'jsencrypt';
import CryptoJS from 'crypto-js';
import { useParams, useLocation } from 'react-router-dom';
import CertificateHashForm from './CertificateHashForm'; // Import the CertificateHashForm component
import JSBI from 'jsbi';

function GenerateCertificate() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const requestId = queryParams.get('requestId');
  const studentAddress = queryParams.get('address');
  const publicKey = queryParams.get('publicKey');
  const privateKey = queryParams.get('privateKey');
  const symmetricKey = queryParams.get('symmetricKey');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [age, setAge] = useState('');
  const [degree, setDegree] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [percentage, setPercentage] = useState('');
  const [familyIncome, setFamilyIncome] = useState('');
  const [category, setCategory] = useState('');
  const [nationality, setNationality] = useState('');
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    async function initWeb3() {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          await window.ethereum.enable();
          const accounts = await web3Instance.eth.getAccounts();
          setWeb3(web3Instance);
          setAccounts(accounts);
        } catch (error) {
          console.error('Error enabling Ethereum:', error);
        }
      } else {
        console.error('Web3 provider not detected');
      }
    }

    initWeb3();
  }, []);

  useEffect(() => {
    async function initContract() {
      if (web3) {
        try {
          const networkId = await web3.eth.net.getId();
          const deployedNetwork = CertificateContract.networks[networkId];
          const contractInstance = new web3.eth.Contract(
            CertificateContract.abi,
            deployedNetwork && deployedNetwork.address,
          );
          setContract(contractInstance);
        } catch (error) {
          console.error('Error initializing contract:', error);
        }
      }
    }

    initContract();
  }, [web3]);
  
  const encryptWithSymmetricKey = (data, key) => {
    return CryptoJS.AES.encrypt(data, key).toString();
  };
  
  const encryptSymmetricKeyWithPublicKey = (key, publicKey) => {
    const jsEncrypt = new JSEncrypt();
    jsEncrypt.setPublicKey(publicKey);
    return jsEncrypt.encrypt(key);
  };

  // Prime field modulus (ALT_BN128 curve)
  const p = JSBI.BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");
  
  // Function to convert a string to a 128-bit field element
  const stringToZokratesInteger = (str) => {
      // Convert the string to a BigInt using its character codes
      let numBigInt = JSBI.BigInt(0);
      for (let i = 0; i < str.length; i++) {
          numBigInt = JSBI.add(
              JSBI.multiply(numBigInt, JSBI.BigInt(256)),
              JSBI.BigInt(str.charCodeAt(i))
          );
      }
  
      // Ensure the number is within the 128-bit range
      const max128BitValue = JSBI.subtract(JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(128)), JSBI.BigInt(1));
      if (JSBI.greaterThan(numBigInt, max128BitValue)) {
          numBigInt = JSBI.bitwiseAnd(numBigInt, max128BitValue);
      }
  
      // Map the number to a field element by taking the remainder with p
      const fieldElement = JSBI.remainder(numBigInt, p);
  
      return fieldElement;
  };
  


  const handleSubmit = async(e) => {
        e.preventDefault();
        const formData = {
          name,
          address,
          phoneNumber,
          age,
          degree,
          aadharNumber,
          percentage,
          familyIncome,
          category,
          nationality
        };
      const certificateContent = {
        name: formData.name,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        age: formData.age.toString(),
        degree: formData.degree,
        aadharNumber: formData.aadharNumber,
        percentage: formData.percentage.toString(),
        familyIncome: formData.familyIncome.toString(),
        category: formData.category,
        nationality: formData.nationality
      };
    
       // Convert certificate content to string
    const serializedCertificateContent = JSON.stringify(certificateContent);
        // Convert values to hexadecimal
        const myaddress = stringToZokratesInteger(address.toLowerCase()).toString();
        const myage = stringToZokratesInteger(age).toString();
        const mydegree = stringToZokratesInteger(degree.toLowerCase()).toString();
        const myaadharNumber = stringToZokratesInteger(aadharNumber).toString();
        const mypercentage = stringToZokratesInteger(percentage).toString();
        const myfamilyincome = stringToZokratesInteger(familyIncome).toString();
        const mycaste = stringToZokratesInteger(category.toLowerCase()).toString();
        const mynationality = stringToZokratesInteger(nationality.toLowerCase()).toString();
           console.log(myaddress)
           console.log(myage)
           console.log(mydegree)
           console.log(myaadharNumber)
           console.log(mypercentage)
           console.log(myfamilyincome)
           console.log(mycaste)
           console.log(mynationality)
          
      const caPublicKey = publicKey;  // Assign caPublicKey correctly
  
      const rsaPrivateKey = KEYUTIL.getKey(privateKey);
      const sig = new KJUR.crypto.Signature({ alg: 'SHA256withRSA' });
      sig.init(rsaPrivateKey);
      sig.updateString(serializedCertificateContent);
      const signature = sig.sign();
      console.log(caPublicKey);
      const combinedData = `${serializedCertificateContent}|${signature}|${caPublicKey}`;
      console.log(combinedData);
      // Hybrid encryption
      const encryptedMessage = encryptWithSymmetricKey(combinedData, symmetricKey);
      const publicKeyReceiver = await contract.methods.getRequestPublicKey(requestId).call({ from: accounts[0] });
      console.log(publicKeyReceiver)
      const encryptedSymmetricKey = encryptSymmetricKeyWithPublicKey(symmetricKey, publicKeyReceiver);
  
      // Concatenate encrypted symmetric key and encrypted message
      const encryptedData = `${encryptedSymmetricKey}|${encryptedMessage}`;
  
      await contract.methods.approveRequest(requestId, encryptedData).send({ from: accounts[0] });
  };
  
  const handleCertificateHashSubmit = async (certificateHash,certificateHash1, certificateHash2,certificateHash3) => {
    try {
      await contract.methods.setCertificateHash(studentAddress, certificateHash, certificateHash1, certificateHash2, certificateHash3).send({ from: accounts[0] });
    console.log('Certificate hashes set successfully.');
      console.log('Certificate hash set successfully.');
    } catch (error) {
      console.error('Error setting certificate hash:', error);
    }
  };

  return (
    <div className="GenerateCertificateForm">
      <h2>Generate Certificate</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Address:</label>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Phone Number:</label>
          <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Age:</label>
          <input type="text" value={age} onChange={(e) => setAge(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Degree:</label>
          <input type="text" value={degree} onChange={(e) => setDegree(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Aadhar Number:</label>
          <input type="text" value={aadharNumber} onChange={(e) => setAadharNumber(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Percentage:</label>
          <input type="text" value={percentage} onChange={(e) => setPercentage(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Family Income:</label>
          <input type="text" value={familyIncome} onChange={(e) => setFamilyIncome(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Category:</label>
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Nationality:</label>
          <input type="text" value={nationality} onChange={(e) => setNationality(e.target.value)} required />
        </div>
        <button type="submit">Generate Certificate</button>
      </form>
      <CertificateHashForm onSubmit={handleCertificateHashSubmit} />
    </div>
  );
}

export default GenerateCertificate;
