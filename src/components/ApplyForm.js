import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import axios from 'axios';
import Web3 from 'web3';
import ScholarshipContract from '../abis/Scholarship.json';
import CertificateContract from '../abis/CertificateContract.json';
import { create } from 'ipfs-http-client';
import './ApplyForm.css';
import JSBI from 'jsbi';
import CryptoJS from 'crypto-js';

function ApplyForm() {
  const history = useHistory();
  const location = useLocation();
  const [providerAddress, setProviderAddress] = useState('');
  const [scholarshipAmount, setScholarshipAmount] = useState(0);
  const [scholarshipId, setScholarshipId] = useState(0);
  const [eligibilityInput, setEligibilityInput] = useState('');
  const [status, setStatus] = useState('');
  const [certificate, setCertificate] = useState(null);
  const [proof, setProof] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: ''
  });
  const ipfs = create({ host: '127.0.0.1', port: 5001, protocol: 'http' });

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const address = searchParams.get('providerAddress');
    const amount = parseInt(searchParams.get('scholarshipAmount'));
    const Id = parseInt(searchParams.get('scholarshipId'));
    const encodedEligibility = JSON.parse(decodeURIComponent(searchParams.get('eligibility')));
    console.log(encodedEligibility)
    setProviderAddress(address);
    setScholarshipAmount(amount);
    setScholarshipId(Id);
    setEligibilityInput(encodedEligibility);
  }, [location]);

  const handleFileChange = (e) => {
    setCertificate(e.target.files[0]);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isValidPhoneNumber = (phoneNumber) => {
    const phonePattern = /^\d{10}$/;
    return phonePattern.test(phoneNumber);
  };

  const parseCertificate = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const lines = text.split('\n');
        const certificateData = {};
        lines.forEach(line => {
          const [key, value] = line.split(':').map(part => part.trim());
          certificateData[key] = value;
        });
        resolve(certificateData);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
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
  

  const generateProof = async () => {
    try {
      if (!certificate) {
        setStatus('Please upload a certificate.');
        return;
      }
      const web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork1 = CertificateContract.networks[networkId];
      const contractInstance1 = new web3.eth.Contract(
        CertificateContract.abi,
        deployedNetwork1 && deployedNetwork1.address,
      );
      const publicKeyHash = await getCertificateHash(accounts[0], contractInstance1);
      const certificatehash = publicKeyHash[0];
      const certificatehash1 = publicKeyHash[1];
      const certificatehash2 = publicKeyHash[2];
      const certificatehash3 = publicKeyHash[3];
      console.log(certificatehash);
      console.log(certificatehash1);
      console.log(certificatehash2);
      console.log(certificatehash3);
      const parsedCertificate = await parseCertificate(certificate);
      console.log(parsedCertificate)
       // Rendering attributes from parsed certificate and eligibility criteria
    // Array to hold extracted values
    const extractedValues = [];

    // Iterate over the key-value pairs of the parsed certificate
    Object.entries(parsedCertificate).forEach(([key, value]) => {
      extractedValues.push({ key, value });
    });
  
    const myaddress = stringToZokratesInteger(extractedValues[1].value.toLowerCase()).toString();
    const myage = stringToZokratesInteger(extractedValues[3].value).toString();
    const mydegree = stringToZokratesInteger(extractedValues[4].value.toLowerCase()).toString();
    const myaadharNumber = stringToZokratesInteger(extractedValues[5].value).toString();
    const mypercentage = stringToZokratesInteger(extractedValues[6].value).toString();
    const myfamilyincome = stringToZokratesInteger(extractedValues[7].value).toString();
    const mycaste = stringToZokratesInteger(extractedValues[8].value.toLowerCase()).toString();
    const mynationality = stringToZokratesInteger(extractedValues[9].value.toLowerCase()).toString();
       // Array to hold extracted values
       console.log(extractedValues[8].value.toLowerCase())
       console.log(extractedValues[1].value.toLowerCase())
       console.log(mydegree)
       console.log(myaadharNumber)
       console.log(mypercentage)
       console.log(myfamilyincome)
       console.log(mycaste)
       console.log(mynationality)
      const criteriaArray = eligibilityInput.split(',');
      const eligibilityValues = {}; // Initialize an empty object to store eligibility criteria
      
      for (const criterion of criteriaArray) {
        const [fieldWithValue, value] = criterion.split(':');
        const operator = fieldWithValue.match(/[<>]?=/); // Extract operator from the fieldWithValue string
        const field = fieldWithValue.replace(/[<>]?=/, ''); // Remove the operator from the fieldWithValue string
        const criterionValue = value.trim().toLowerCase();
        
        // Store the criterion in the eligibilityCriteria object
        eligibilityValues[field] = {
          operator: operator[0],
          value: criterionValue
        };
      }
      
      console.log('Eligibility Criteria:', eligibilityValues);
      
     console.log(eligibilityValues['percentage'].value);
      const degree = stringToZokratesInteger(eligibilityValues['degree'].value).toString();
      const caste= stringToZokratesInteger(eligibilityValues['caste'].value).toString();
      const nationality= stringToZokratesInteger(eligibilityValues['nationality'].value).toString();
      const minimum_percentage= stringToZokratesInteger(eligibilityValues['percentage'].value).toString();
      const age= stringToZokratesInteger(eligibilityValues['age'].value).toString();
      let maximum_age = 0;
      let minimum_age = 0;
      if(eligibilityValues['age'].operator === '<=')
      maximum_age= age;
      else
      maximum_age= stringToZokratesInteger("45").toString();
      if(eligibilityValues['age'].operator === '>=')
      minimum_age = age;
      else
      minimum_age = stringToZokratesInteger("7").toString();
      const maximum_familyincome= stringToZokratesInteger(eligibilityValues['familyIncome'].value).toString();
      const data = {
        certificatehash: certificatehash,
        certificatehash1: certificatehash1,
        certificatehash2: certificatehash2,
        certificatehash3: certificatehash3,
        myaddress: myaddress,
        myage: myage,
        mydegree: mydegree,
        aadharNumber: myaadharNumber,
        mypercentage: mypercentage,
        myfamilyincome: myfamilyincome,
        mycaste: mycaste,
        mynationality: mynationality,
        degree: degree,
        caste: caste,
        nationality: nationality,
        minimum_percentage: minimum_percentage,
        minimum_age: minimum_age,
        maximum_age: maximum_age,
        maximum_familyincome: maximum_familyincome
      };      
      console.log(data)
      const response = await axios.post('http://localhost:3001/api/generate-proof', data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const generatedProof = response.data.proof;
      setProof(generatedProof);
      setStatus('Proof generated successfully.');
    } catch (error) {
      console.error('Error generating proof:', error);
      setStatus('Error generating proof.');
    }
  };

  const compileZokratesCode = async (zokratesCode) => {
    try {
      console.log(zokratesCode)
      const response = await axios.post('http://localhost:3001/api/compile-zokrates', {
        code: zokratesCode
      });
      console.log('Compilation successful:', response.data.output);
    } catch (error) {
      console.error('Compilation failed:', error.response?.data?.error);
    }
  };
  
  const zokratesCode = `
  import "hashes/sha256/512bitPacked" as sha256packed;

  def main(public field certificatehash, public field certificatehash1, public field certificatehash2, public field certificatehash3, private field myaddress, private field myage, private field mydegree, private field aadharNumber, private field mypercentage,  private field myfamilyincome, private field mycaste, private field mynationality, public  field degree, public field caste, public field nationality, public field minimum_percentage, public field maximum_age, public field minimum_age, public field maximum_familyincome) -> bool {

    field[2] hash = sha256packed([myaddress,myage,mydegree,aadharNumber]);
    field[2] hash1 = sha256packed([mypercentage,myfamilyincome,mycaste,mynationality]);
    assert(hash[0] == certificatehash);
    assert(hash[1] == certificatehash1);
    assert(hash1[0] == certificatehash2);
    assert(hash1[1] == certificatehash3);
    assert(mypercentage >= minimum_percentage, "Percentage requirement not met");
    assert(myage <= maximum_age, "Age requirement not met");
    assert(myage >= minimum_age, "Age requirement not met");
    assert(mydegree == degree, "Degree requirement not met");
    assert(mycaste == caste, "Caste requirement not met");
    assert(mynationality == nationality, "Nationality requirement not met");
    assert(myfamilyincome <= maximum_familyincome, "Family income requirement not met");
    return true;
}

  `;

  const runSetup = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/run-setup');
      setStatus(response.data.message);
    } catch (error) {
      console.error('Error running setup:', error);
      setStatus('Failed to run setup phase');
    }
  };

  const exportVerifier = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/export-verifier');
      setStatus(response.data.message);
    } catch (error) {
      console.error('Error exporting verifier:', error);
      setStatus('Failed to export verifier');
    }
  };


  const applyForScholarship = async () => {
    try {
      if (!proof) {
        setStatus('Please generate the proof first.');
        return;
      }
  
      const web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = ScholarshipContract.networks[networkId];
      const contractInstance = new web3.eth.Contract(
        ScholarshipContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
  
      // Call the applyForScholarship function in the smart contract
      await contractInstance.methods
        .applyForScholarship(
          providerAddress,
          scholarshipId,
          formData.name,
          formData.email,
          formData.phoneNumber,
          scholarshipAmount
        )
        .send({ from: accounts[0] });
  
      setStatus('Application successful');
      history.push('/');
    } catch (error) {
      console.error('Error applying for scholarship:', error);
      setStatus('Application failed');
    }
  };
  

  const submitProof = async () => {
    try {
      if (!proof) {
        setStatus('Please generate the proof first.');
        return;
      }
      const web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = ScholarshipContract.networks[networkId];
      const contractInstance = new web3.eth.Contract(
        ScholarshipContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
        // Convert proof JSON object to a string
        const proofString = JSON.stringify(proof);

        // Convert the string to a buffer using TextEncoder
        const encoder = new TextEncoder();
        const fileBuffer = encoder.encode(proofString);

        // Add the buffer to IPFS
        const { cid } = await ipfs.add(fileBuffer);
        const cid_str =cid.toString();
        console.log('CID:', cid.toString());
      await contractInstance.methods.uploadProof(scholarshipId, cid_str).send({ from: accounts[0] });
      setStatus('Proof submitted successfully.');
      console.log('IPFS Proof Hash:', cid);
    } catch (error) {
      console.error('Error submitting proof:', error);
      setStatus('Error submitting proof.');
    }
  };

  const getCertificateHash = async (account, contractInstance) => {
    try {
    const hash = await contractInstance.methods.getCertificateHash(account).call();
    return hash;
    } catch (error) {
    console.error('Error getting certificate hash:', error);
    throw new Error('Failed to get certificate hash');
    }
    };
    
    const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidPhoneNumber(formData.phoneNumber)) {
    setStatus('Please enter a valid phone number.');
    return;
    }
    console.log('Scholarship details submitted successfully');
    applyForScholarship();
    };
    
    const downloadProof = () => {
      if (!proof) {
        setStatus('No proof available to download.');
        return;
      }
    
      // Create a Blob with the proof data
      const proofBlob = new Blob([JSON.stringify(proof)], { type: 'application/json' });
    
      // Create a URL for the Blob
      const proofUrl = URL.createObjectURL(proofBlob);
    
      // Create a temporary anchor element to trigger the download
      const downloadLink = document.createElement('a');
      downloadLink.href = proofUrl;
      downloadLink.download = 'proof.json'; // Specify the filename for the downloaded file
      document.body.appendChild(downloadLink);
    
      // Simulate a click event to trigger the download
      downloadLink.click();
    
      // Clean up: remove the temporary anchor element and revoke the URL
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(proofUrl);
    
      setStatus('Proof downloaded successfully.');
    };
    
    return (
    <div className="apply-form-container">
    <h3>Apply Form</h3>
    <form onSubmit={handleSubmit}>
    <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} />
    <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
    <input type="text" name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleChange} />
    <button type="submit">Submit Application</button>
    </form>
    <div className="certificate-upload-section">
    <h1>Create Zero Knowledge Proof</h1>
    <button onClick={() => compileZokratesCode(zokratesCode)}>Compile zokrates code</button>
    <button onClick={runSetup}>Run Setup</button>
    <button onClick={exportVerifier}>Export Verifier</button>
    <h4>Upload Certificate</h4>
    <input type="file" name="certificate" onChange={handleFileChange} />
    <button onClick={generateProof}>Generate Proof</button>
    <button onClick={downloadProof}>Download Proof</button>
    <button onClick={submitProof}>Submit Proof</button>
    {status && <p className="status-message">{status}</p>}
    </div>
    </div>
    );
    }
    
    export default ApplyForm;
