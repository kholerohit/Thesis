import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import ScholarshipContract from '../abis/Scholarship.json';
import './AppliedStudentBox.css';
import { create } from 'ipfs-http-client';
import axios from 'axios';

function AppliedStudentBox({ student, providerAddress }) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [validationStatus, setValidationStatus] = useState('');
    const [fundAvailable, setFundAvailable] = useState(true);
    const [proofContent, setProofContent] = useState('');
    useEffect(() => {
        checkApplicationStatus();
    },[status]);

    const ipfs = create({ host: '127.0.0.1', port: 5001, protocol: 'http' });
    const checkApplicationStatus = async () => {

        try {
            setLoading(true);
            const web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = ScholarshipContract.networks[networkId];
            const contractInstance = new web3.eth.Contract(
                ScholarshipContract.abi,
                deployedNetwork && deployedNetwork.address,
            );
            const isFundAvailable = await contractInstance.methods.isFundsAvailableForTheProvider(student.studentAddress, student.scholarshipId).call();
            setFundAvailable(isFundAvailable);
                const remainingApplied = await contractInstance.methods.remainingApplied(providerAddress,student.studentAddress).call();
                const isLimitReached = await contractInstance.methods.isScholarshipLimitReached(student.scholarshipId).call();
                if (remainingApplied.includes(student.scholarshipId)) {
                    setStatus("Already applied");
                } 
                if(!remainingApplied.includes(student.scholarshipId)){
                 // Get the provider address that accepted the scholarship
                 const acceptedByProvider = await contractInstance.methods.isStudentScholarshipAccepted(student.studentAddress).call();
                 if (acceptedByProvider !== '0x0000000000000000000000000000000000000000') {
                    setStatus(`Already accepted by ${acceptedByProvider}`);
                } 
                else if (isLimitReached) {
                    setStatus("Scholarship limit reached");
                }
                else {
                    setStatus("");
                }
                console.log(acceptedByProvider)
            }
            setLoading(false);
        } catch (error) {
            console.error('Error checking application status:', error);
            setLoading(false);
        }
    };
    
    const getProof = async () => {
        try {
            setLoading(true);
            const web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = ScholarshipContract.networks[networkId];
            const contractInstance = new web3.eth.Contract(
                ScholarshipContract.abi,
                deployedNetwork && deployedNetwork.address,
            );

            // Call the getProofForScholarship function from the contract
            const proofCID = await contractInstance.methods.getProofForScholarship(student.studentAddress, student.scholarshipId).call();
         // Retrieve the file from IPFS using its CID
         const stream = ipfs.cat(proofCID);
         const decoder = new TextDecoder();
         let proofString = '';

         for await (const chunk of stream) {
             proofString += decoder.decode(chunk, { stream: true });
         }

         proofString += decoder.decode(); // Finish the stream
         const proofJson = JSON.parse(proofString);
         console.log(proofJson)
         setProofContent(proofJson);
            setLoading(false);
        } catch (error) {
            console.error('Error retrieving proof:', error);
            setLoading(false);
        }
    };


    const acceptStudent = async () => {
        try {
            setLoading(true);
            const web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
            const accounts = await web3.eth.getAccounts();
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = ScholarshipContract.networks[networkId];
            const contractInstance = new web3.eth.Contract(
                ScholarshipContract.abi,
                deployedNetwork && deployedNetwork.address,
            );

            // Accept the student's application
            await contractInstance.methods.acceptStudent(providerAddress, student.studentAddress, student.scholarshipId).send({ from: accounts[0] });
            setStatus('Application accepted');
            setLoading(false);
        } catch (error) {
            console.error('Error accepting student:', error);
            setLoading(false);
        }
    };

    const rejectStudent = async () => {
        try {
            setLoading(true);
            const web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
            const accounts = await web3.eth.getAccounts();
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = ScholarshipContract.networks[networkId];
            const contractInstance = new web3.eth.Contract(
                ScholarshipContract.abi,
                deployedNetwork && deployedNetwork.address,
            );

            // Reject the student's application
            await contractInstance.methods.rejectStudent(providerAddress, student.studentAddress, student.scholarshipId).send({ from: accounts[0] });
            setStatus('Application rejected');
            setLoading(false);
        } catch (error) {
            console.error('Error rejecting student:', error);
            setLoading(false);
        }
    };

    const validateProof = async () => {
        try {
            setLoading(true);
            const response = await axios.post('http://localhost:3001/api/verify-proof', { proof: JSON.stringify(proofContent) }, {
                headers: {
                  'Content-Type': 'application/json'
                }
              });
            setValidationStatus(response.data.message);
            setLoading(false);
        } catch (error) {
            console.error('Error validating proof:', error);
            setLoading(false);
        }
    };

    return (
        <div className="student-box">
            <p>Student Address: {student.studentAddress}</p>
            <p>Scholarship Id: {student.scholarshipId.toString()}</p>
            <p>Name: {student.name}</p>
            <p>Phone number: {student.phoneNumber.toString()}</p>
            <p>Email: {student.email}</p>
            {status && <div className="status-box">{status}</div>}
            {validationStatus}
            <div className="button-row">
                {fundAvailable && status === "" && (
                    <>
                        <button className="get-proof-button" onClick={getProof} disabled={loading}>Get Proof</button>
                        <button className="validate-proof-button" onClick={validateProof} disabled={loading}>Validate Application</button>
                        <button className="accept-button" onClick={acceptStudent} disabled={loading}>Accept</button>
                    </>)}
                    {(status === "" || status === "Scholarship limit reached") && (
                <button className="reject-button" onClick={rejectStudent} disabled={loading}>Reject</button>
            )}
            </div>
        </div>
    );
}

export default AppliedStudentBox;

