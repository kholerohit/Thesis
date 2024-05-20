import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Web3 from 'web3';
import ScholarshipContract from '../abis/Scholarship.json';
import './ScholarshipBox.css';

function ScholarshipBox({ Id, providerAddress, companyName, scholarshipAmount,description,eligibility, onAcceptedApplication }) {
    const history = useHistory();
    const [loading, setLoading] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [hasAccepted, setHasAccepted] = useState(false);
    const [status, setStatus] = useState("");

    useEffect(() => {
        checkApplicationStatus();
    }, []);

    const checkApplicationStatus = async () => {
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

            const hasApplied = await contractInstance.methods.hasStudentAppliedForScholarship(accounts[0], providerAddress, Id).call({ from: accounts[0] });
            setHasApplied(hasApplied);

            const hasAccepted = await contractInstance.methods.hasStudentAcceptedScholarship(accounts[0], providerAddress, Id).call({ from: accounts[0] });
            setHasAccepted(hasAccepted);

            if (hasApplied && !hasAccepted) {
                setStatus("Application in review");
            } else if (hasAccepted) {
                setStatus("Application accepted");
                onAcceptedApplication(); // Notify parent component of accepted application
            } else {
                setStatus("");
            }

            setLoading(false);
        } catch (error) {
            console.error('Error checking application status:', error);
            setLoading(false);
        }
    };

    const redirectToApplyForm = () => {
        const encodedEligibility = encodeURIComponent(JSON.stringify(eligibility));
        history.push(`/apply?providerAddress=${providerAddress}&scholarshipAmount=${scholarshipAmount}&scholarshipId=${Id}&eligibility=${encodedEligibility}`);
    };
    

    return (
        <div className="scholarship-box">
            <h3>Scholarship Details</h3>
            <p><strong>Scholarship Id:</strong>{Id}</p>
            <p><strong>Provider Address:</strong> {providerAddress}</p>
            <p><strong>Company Name:</strong>{companyName}</p>
            <p><strong>Scholarship Amount:</strong> {scholarshipAmount}</p>
            <p><strong>Description:</strong> {description}</p>
            <div>
                <p><strong>Eligibility:</strong></p>
                {eligibility.split(",").map((criterion, index) => (
                <p key={index}>{criterion.trim()}</p>
                ))}
            </div>
            {status && <div className="status-box">{status}</div>}
            {!hasApplied && !hasAccepted && !loading && (
                <button onClick={redirectToApplyForm}>Apply</button>
            )}
        </div>
    );
}

export default ScholarshipBox;
