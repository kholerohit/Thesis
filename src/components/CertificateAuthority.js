// CertificateAuthority.js

import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import CertificateContract from '../abis/CertificateContract.json';
import './CertificateAuthority.css';
import { JSEncrypt } from 'jsencrypt';
import { useHistory } from 'react-router-dom';
import { KEYUTIL } from 'jsrsasign';
import CryptoJS, { enc } from 'crypto-js';
import { create } from 'ipfs-http-client';
import { FaAddressCard } from 'react-icons/fa';

function CertificateAuthority() {
  const history = useHistory();
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [requestCounter, setRequestCounter] = useState(0);
  const [requests, setRequests] = useState([]);
  const [decryptedFiles, setDecryptedFiles] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [approveStatus, setApproveStatus] = useState('');
  const [rejectStatus, setRejectStatus] = useState('');
  const [PublicKey, setPublicKey] = useState('');
  const [PrivateKey, setPrivateKey] = useState('');
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

        // Fetch initial request counter
        const counter = await contractInstance.methods.getRequestCounter().call();
        setRequestCounter(parseInt(counter));
      }
    }

    initContract();
  }, [web3]);

  useEffect(() => {
    async function fetchData() {
      if (contract && requestCounter > 0) {
        const requestsData = [];
        for (let i = 1; i <= requestCounter; i++) {
          const request = await contract.methods.getRequest(i).call();
          requestsData.push(request);
        }
        console.log('Fetched requests:', requestsData);
        setRequests(requestsData);
      }
    }

    fetchData();
  }, [contract, requestCounter]);

  const decryptFiles = async (encryptedFiles, encryptedSymmetricKey, requestId) => {
    try {
      const decryptedFilesData = [];
      for (const encryptedFile of encryptedFiles) {
        const fileBufferGenerator = ipfs.cat(encryptedFile);
        console.log(encryptedFile)
        let encryptedData = '';
        console.log(fileBufferGenerator)
        for await (const fileBuffer of fileBufferGenerator) {
          if (fileBuffer === undefined) {
            throw new Error('Failed to fetch file content from IPFS');
          }
          encryptedData += new TextDecoder().decode(fileBuffer);
        }
        console.log(encryptedData)
        const decryptedSymmetricKey = decryptWithPrivateKey(encryptedSymmetricKey, PrivateKey);
        const decryptedFileData = decryptWithSymmetricKey(encryptedData, decryptedSymmetricKey);
        console.log(decryptedFileData)
        decryptedFilesData.push({ content: decryptedFileData, fileName: encryptedFile });
      }
      setDecryptedFiles(decryptedFilesData);
      setSelectedRequestId(requestId);
    } catch (error) {
      console.error('Error decrypting files:', error);
    }
  };
  
  
  const decryptWithSymmetricKey = (encryptedData, key) => {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8); // Ensure it's in Base64 format
    return decryptedData;
  };
  
  const decryptWithPrivateKey = (encryptedData, privateKey) => {
    const jsEncrypt = new JSEncrypt();
    jsEncrypt.setPrivateKey(privateKey);
    return jsEncrypt.decrypt(encryptedData);
  };

  const approvedRequest = async (requestId , address) => {
    const key = CryptoJS.lib.WordArray.random(16).toString();
    history.push(`/form?requestId=${encodeURIComponent(requestId)}&address=${encodeURIComponent(address)}&publicKey=${encodeURIComponent(PublicKey)}&privateKey=${encodeURIComponent(PrivateKey)}&symmetricKey=${encodeURIComponent(key)}`);
  };

  const rejectRequest = async (requestId) => {
    try {
      // Implement reject request logic
      setRejectStatus('Request Rejected Successfully');
    } catch (error) {
      console.error('Error rejecting request:', error);
      setRejectStatus('Failed to reject request');
    }
  };

  const generateKeyPair = async () => {
    try {
      /*const rsaKeypair = KEYUTIL.generateKeypair('RSA', 4096);
      const privateKey = KEYUTIL.getPEM(rsaKeypair.prvKeyObj, 'PKCS8PRV');
      const publicKey = KEYUTIL.getPEM(rsaKeypair.pubKeyObj);*/
      const publicKey = `-----BEGIN PUBLIC KEY-----
      MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAnUUOU22JOAP4Cu6CZKva
      E4FCFGVkJaZJuqTlIpq1v//c9OOUMYGiV1XK6V6cGoOZaJ1Qs2MkQ7jr92rljA1v
      AsR7f6LpgAf2Oe7rK+xaI0ibFTeIerRFdNcSf3wa2Uf5wc47mKQ+DfCBfHzLK4ZH
      pKcNsxeu7O0T2ZyMnkX23kd3Tg++Q/ELU9pAPKzcYfqlkR3z+q29jWk+CI6lgtTc
      TmtuYCJn2ZDN81hww9VOtyBlSqRyBRyQC3i0NUhNpNx1X7V1Urd7bnywMVWj6xXe
      oFzVg7amX+05PYYnjcBl386XMoScCDAljQA0GmbL2oIRge9HDj32sHylY0Tvb8IA
      n5LdjUAr852akgSOBD8oHjh0rWiI+ffNUsmeDfWKIYyPCGY83pfFoCAwcsw/jCQB
      JpqnxK7TOoUaZxLpPHwLWhYRXN4+VL2icHj6f2okz4GTPLaon8pJa0EsaW3vWqic
      ZgXCVKTlrJA7hlL7ltK+SoWpD/Kw/ZH2sdvxIiNMWKrzcFx0hrASsF87zupwoQ36
      oMUfFpUMNMVYYK4pNcujmIP/TgrXxI7e9G/Zw+SocRywuboG20a4RfrHlfXn9Q1I
      58Ne74XavEt1vVx6vBgKOks/6y1S1okNkpIXOwsoFEu7ubcrHNQlAnsurHCBwBkx
      KdSSd9bt1Kghzr7AjrfpXLsCAwEAAQ==
      -----END PUBLIC KEY-----`;
      const privateKey = `-----BEGIN PRIVATE KEY-----
      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
      R7SX6Nipgqv7SZ+mmCLenn8rUuC3EA==
      -----END PRIVATE KEY-----`;
      await contract.methods.setCAPublicKey(publicKey).send({ from: accounts[0] });
      setPublicKey(publicKey);
      setPrivateKey(privateKey);
      alert('CA Keys set successfully');
    } catch (error) {
      console.error('Error generating key pair:', error);
    }
  };
 
  return (
    <div className="CertificateAuthority">
      <h1>CA Certificate Component</h1>
      <button onClick={generateKeyPair}>Generate Key Pair</button>
      <div className="PendingRequests">
        {requests.map((request, index) => (
          <div key={index} className="request-item">
            <p>Request ID: {request.id}</p>
            <p>Name: {request.requester}</p>
            <p>Status: {request.approved ? 'Approved' : 'Pending'}</p>
            {!request.approved && (
              <div>
                <button onClick={() => decryptFiles(request.encryptedFiles,request.encryptedSymmetricKey,request.id)}>Decrypt Files</button>
                <button onClick={() => approvedRequest(request.id, request.requester)}>Approve Request</button>
                <button onClick={() => rejectRequest(request.id)}>Reject Request</button>
              </div>
            )}
          {request.id === selectedRequestId && decryptedFiles.length > 0 && (
  <div>
    {decryptedFiles.map((decryptedFile, index) => {
      return (
        <div key={index} className="decrypted-file">
          <h2>Decrypted File {index + 1}</h2>
          <iframe
            title={`Decrypted File ${index + 1}`}
            src={`${decryptedFile.content}`}
            width="100%"
            height="400"
          />
          <a
            href={`${decryptedFile.content}`}
            download={`Decrypted_File_${index + 1}.pdf`}
          >
            Download PDF
          </a>
        </div>
      );
    })}
  </div>
)}
          </div>
        ))}
      </div>
      <p>{approveStatus}</p>
      <p>{rejectStatus}</p>
    </div>
  );
}

export default CertificateAuthority;

