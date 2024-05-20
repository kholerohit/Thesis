import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import CertificateContract from '../abis/CertificateContract.json';
import './CertificateComponent.css';
import jsrsasign from 'jsrsasign';
import { JSEncrypt } from 'jsencrypt';
import CryptoJS from 'crypto-js';
import { create } from 'ipfs-http-client';

function CertificateComponent() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [requestStatus, setRequestStatus] = useState('');
  const [downloadStatus, setDownloadStatus] = useState('');
  const [caPublicKey, setCAPublicKey] = useState('');
  const [encryptedFiles, setEncryptedFiles] = useState({
    adhaar: '',
    degree: '',
    income: '',
    caste: '',
  });
  const [symmetricKey, setSymmetricKey] = useState('');
  const ipfs = create({ host: '127.0.0.1', port: 5001, protocol: 'http' });

  useEffect(() => {
    async function initWeb3() {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.enable();
        const accounts = await web3Instance.eth.getAccounts();
        setWeb3(web3Instance);
        setAccounts(accounts);
      } else {
        console.error('Web3 provider not detected');
      }
    }

    initWeb3();
  }, []);

  useEffect(() => {
    async function initContract() {
      if (web3) {
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = CertificateContract.networks[networkId];
        const contractInstance = new web3.eth.Contract(
          CertificateContract.abi,
          deployedNetwork && deployedNetwork.address,
        );
        setContract(contractInstance);
      }
    }

    initContract();
  }, [web3]);

  const generateSymmetricKey = async () => {
    try {
      const symmetricKey = CryptoJS.lib.WordArray.random(32).toString();
      setSymmetricKey(symmetricKey);
      return symmetricKey;
    } catch (error) {
      console.error('Error generating symmetric key:', error);
      return null;
    }
  };

  const requestCAPublicKey = async () => {
    try {
      const caKey = await contract.methods.getCAPublicKey().call();
      setCAPublicKey(caKey);
      console.log('CA Public Key:', caKey);
    } catch (error) {
      console.error('Error getting CA public key:', error);
    }
  };

  const handleFileUpload = async (event, docType) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const fileData = event.target.result;
        const encryptedFileDataSymmetric = CryptoJS.AES.encrypt(fileData, symmetricKey).toString();
        const { path } = await ipfs.add(encryptedFileDataSymmetric);
        setEncryptedFiles((prevFiles) => ({ ...prevFiles, [docType]: path }));
      } catch (error) {
        console.error('Error encrypting or uploading file:', error);
      }
    };
    reader.readAsDataURL(file);
  };

  const generateKeyPair = () => {
    try {
      /*const rsaKeypair = jsrsasign.KEYUTIL.generateKeypair('RSA', 4096);
      const privateKey = jsrsasign.KEYUTIL.getPEM(rsaKeypair.prvKeyObj, 'PKCS8PRV');
      const publicKey = jsrsasign.KEYUTIL.getPEM(rsaKeypair.pubKeyObj);*/
      const publicKey = `-----BEGIN PUBLIC KEY-----
      MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAm7rBPikn28pyXmwbIVma
      k9P9XPFE4kNPa6WFxeI16jW0Po+1cilJl1iOZ8IzGTKCrHkuT32T9EAk2ky55v3Q
      f6X08X6WjQ2pAsV6g2VJX9DC8ZHSNve2YEgm28Yhc66OL8kBYhYXeoVjEN4W2YFF
      tO7VEmgcDuRSE4IukpZt7h/6jhcIze0k/ex4cx664y55V8B3X6jskKysb9b9nue+
      ciA/ZPL49Q/uKDVwGwZr5M6oIlnjam3HB1mVYnXtFnCwG9Zhb1yAUXPoRL9QfD/y
      xVK+7q5XweE02iJZpFzNGKpErWhkBxYOnz273rMziTvAW6c8Rz3qh6Gh95N4K6mU
      /KAnYgJhMuZyEokO8OC6TJdmm5pBMBWcRg6gnGawcCDv/5dIXX3eQXS+pePoPeHf
      UTPOWI5QOO8cIQcumVp15LScaiLTHXpRGAZX+mW1bF9/1j//JT/Ww9qCBWJYt76B
      cBkOHMD1caZsKInmSXyGRCYPLt4B82rcJiDHUne6rYrcoC8sTTeEE5WJ8gM6MeoL
      42SR366T0hTgH6JKIWJZJHltbXAxpRUPrlE2wDDMHygtlPO/W3QNnjrDzFQluFUO
      lvvcMplZ1Yr3z8h4M20SaAma3Wks2VJNKX/UyJWmt8qdVbER2oTIrm08nuqY8n9b
      hyVCq6pwV7ms1oGWgrb5xRkCAwEAAQ==
      -----END PUBLIC KEY-----`;
      const privateKey = `-----BEGIN PRIVATE KEY-----
      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
      ZYam68H+vOhhzIjFb/V424v3fM/CHA==
      -----END PRIVATE KEY-----`;
      console.log(publicKey)
      console.log(privateKey)
      return { privateKey, publicKey };
    } catch (error) {
      console.error('Error generating key pair:', error);
      return null;
    }
  };

  const submitRequest = async () => {
    try {
      const { privateKey, publicKey } = generateKeyPair();
      const jsEncrypt = new JSEncrypt();
      jsEncrypt.setPublicKey(caPublicKey);
      const encryptedSymmetricKey = jsEncrypt.encrypt(symmetricKey);
      await contract.methods.requestCertificate(
        publicKey,
        Object.values(encryptedFiles),
        encryptedSymmetricKey
      ).send({ from: accounts[0] });
      setRequestStatus('Certificate request submitted successfully.');
    } catch (error) {
      console.error('Error submitting certificate request:', error);
      setRequestStatus('Failed to submit certificate request.');
    }
  };

  const decryptWithSymmetricKey = (encryptedData, key) => {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  const downloadCertificate = async () => {
    try {
      const requestId = await contract.methods.getRequestId(accounts[0]).call();
      const encryptedData = await contract.methods.getCertificate(requestId).call();
      console.log(requestId);
      console.log(encryptedData);
      const [encSymmetricKey, encryptedMessage] = encryptedData.split('|');
      const { privateKey, publicKey } = generateKeyPair();
      const jsEncrypt = new JSEncrypt();
      console.log(privateKey)
      console.log(encSymmetricKey)
      jsEncrypt.setPrivateKey(privateKey);
      const symmetricKey = jsEncrypt.decrypt(encSymmetricKey);

      if (!symmetricKey) {
        setDownloadStatus('Failed to decrypt symmetric key.');
        return;
      }

      const decryptedCertificate = decryptWithSymmetricKey(encryptedMessage, symmetricKey);
      console.log(decryptedCertificate)
      const [certificateContent, signature, caPublicKey] = decryptedCertificate.split('|');
      console.log(caPublicKey)
      const isValid = verifyCertificate(certificateContent, signature, caPublicKey);

      if (!isValid) {
        setDownloadStatus('Invalid certificate signature.');
        return;
      }

      const certificate = JSON.parse(certificateContent);
      const certificateText = Object.entries(certificate)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

      const element = document.createElement('a');
      const file = new Blob([certificateText], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = 'certificate.txt';
      document.body.appendChild(element);
      element.click();

      setDownloadStatus('Certificate downloaded successfully.');
    } catch (error) {
      console.error('Error downloading certificate:', error);
      setDownloadStatus('Failed to download certificate.');
    }
  };

  const verifyCertificate = (certificateContent, signature, caPublicKey) => {
    try {
      const sig = new jsrsasign.KJUR.crypto.Signature({ alg: 'SHA256withRSA' });
      sig.init(caPublicKey);
      sig.updateString(certificateContent);
      return sig.verify(signature);
    } catch (error) {
      console.error('Error verifying certificate:', error);
      return false;
    }
  };

  return (
    <div className="CertificateComponent">
      <h1>Certificate Component</h1>
      <button onClick={requestCAPublicKey}>Request CA Public Key</button>
      <button onClick={generateSymmetricKey}>Generate Symmetric Key</button>
      <div>
        <label>
          Aadhaar Card:
          <input type="file" onChange={(event) => handleFileUpload(event, 'adhaar')} accept=".pdf,.jpg,.jpeg,.png" />
        </label>
      </div>
      <div>
        <label>
          Degree Marksheet:
          <input type="file" onChange={(event) => handleFileUpload(event, 'degree')} accept=".pdf,.jpg,.jpeg,.png" />
        </label>
      </div>
      <div>
        <label>
          Family Income Certificate:
          <input type="file" onChange={(event) => handleFileUpload(event, 'income')} accept=".pdf,.jpg,.jpeg,.png" />
        </label>
      </div>
      <div>
        <label>
          Caste Certificate:
          <input type="file" onChange={(event) => handleFileUpload(event, 'caste')} accept=".pdf,.jpg,.jpeg,.png" />
        </label>
      </div>
      <button onClick={submitRequest}>Request Certificate</button>
      <p>{requestStatus}</p>
      <button onClick={downloadCertificate}>Download Certificate</button>
      <p>{downloadStatus}</p>
    </div>
  );
}

export default CertificateComponent;
