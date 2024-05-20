import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Import useParams
import Web3 from 'web3';
import ScholarshipContract from '../abis/Scholarship.json';
import './AddedScholarships.css';

function AddedScholarships() {
    const [scholarships, setScholarships] = useState([]);
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const providerAddress = searchParams.get('providerAddress');
    
    useEffect(() => {
        loadScholarships();
    },[providerAddress]); // Add providerAddress to the dependency array

    const loadScholarships = async () => {
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
            console.log(providerAddress)
            // Call the getScholarships function from the smart contract for the current provider
            const scholarships = await contractInstance.methods.getScholarships(providerAddress).call();
            setScholarships(scholarships);
            console.log(scholarships)
            setLoading(false);
        } catch (error) {
            console.error('Error loading scholarships:', error);
            setLoading(false);
        }
    };

    return (
        <div className ="container">
            <h2>Added Scholarships</h2>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="scholarships-list">
                    {scholarships.length > 0 ? (
                        scholarships.map((scholarship, index) => (
                            <div key={index} className="student-box">
                                <p>Scholarship Id: {scholarship.id.toString()}</p>
                                <p>Provider: {scholarship.provider}</p>
                                <p>Amount: {scholarship.amount.toString()} Ether</p>
                                <p>Maximum Limit: {scholarship.limit.toString()}</p>
                                <p>Description: {scholarship.description}</p>
                                <div>
                                    <p>Eligibility:</p>
                                    {scholarship.eligibilityCriteriaString.split(",").map((criterion, index) => (
                                        <p key={index}>{criterion.trim()}</p>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No scholarships added yet.</p>
                    )}
                </div>
            )}
            <Link to="/provider">Back to Dashboard</Link>
        </div>
    );
}

export default AddedScholarships;
