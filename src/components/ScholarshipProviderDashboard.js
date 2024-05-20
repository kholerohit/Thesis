import React, { useState, useEffect } from 'react';
import Web3 from 'web3'; // Import Web3 library
import { Link } from 'react-router-dom';
import ScholarshipContract from '../abis/Scholarship.json'; // Import compiled contract ABI
import AuthContract from '../abis/Auth.json';
import './ScholarshipProviderDashboard.css'; // Import CSS file

function ScholarshipProviderDashboard() {
    const [scholarshipAmount, setScholarshipAmount] = useState(0);
    const [description, setDescription] = useState(''); // Update state variable name
    const [companyName, setCompanyName] = useState('');
    const [limit, setLimit] = useState(0);
    const [eligibility, setEligibility] = useState(''); // State variable for eligibility criteria
    const [account, setAccount] = useState([]);
    const [providerScholarshipAmount, setProviderScholarshipAmount] = useState(0); 

    useEffect(() => {
        loadAccounts();
        getProviderScholarshipAmount();
    }, []);

    const loadAccounts = async () => {
        try {
            const web3 = new Web3(window.ethereum);
            await window.ethereum.enable(); // Request user permission to access their Ethereum accounts
            const accs = await web3.eth.getAccounts();
            setAccount(accs);
        } catch (error) {
            console.error('Error loading accounts:', error);
        }
    };
  
    const getProviderScholarshipAmount = async () => {
        try {
            const web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
            const accounts = await web3.eth.getAccounts();
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = ScholarshipContract.networks[networkId];
            const contractInstance = new web3.eth.Contract(
                ScholarshipContract.abi,
                deployedNetwork && deployedNetwork.address,
            );
            const providerScholarshipAmount = await contractInstance.methods.getAvailableScholarshipAmount(accounts[0]).call();
            setProviderScholarshipAmount(providerScholarshipAmount);
        } catch (error) {
            console.error('Error fetching provider scholarship amount:', error);
        }
    };
    const addScholarship = async () => {
        try {
            const web3 = new Web3(window.ethereum);
            await window.ethereum.enable(); // Request user permission to access their Ethereum accounts
            const accounts = await web3.eth.getAccounts();
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = ScholarshipContract.networks[networkId];
            const contractInstance = new web3.eth.Contract(
                ScholarshipContract.abi,
                deployedNetwork && deployedNetwork.address,
            );
    
            await contractInstance.methods.addScholarship(
                scholarshipAmount,
                description,
                companyName,
                limit,
                eligibility // Pass eligibility criteria as string
            ).send({ from: accounts[0] });
        } catch (error) {
            console.error('Error adding scholarship:', error);
        }
    };
    
    const handleLogout = async () => {
        try {
            const web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = AuthContract.networks[networkId];
            const contractInstance = new web3.eth.Contract(
                AuthContract.abi,
                deployedNetwork && deployedNetwork.address,
            );
                await contractInstance.methods.logout().send({ from: window.ethereum.selectedAddress });
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };
    return (
        <div className="dashboard-container">
             <div className="available-scholarship-amount">
                <p><strong>Available Funds</strong></p>
                <div className="amount-box">{providerScholarshipAmount.toString()}</div> 
                <button onClick={handleLogout}>Logout</button> {/* Add a logout button */}
            </div>
            <h1>Scholarship Provider Dashboard</h1>
            <div className="add-scholarship">
                <h2>Add Scholarship</h2>
                <div className="input-row">
                    <label>Company Name:</label>
                    <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Your Company Name" />
                </div>
                <div className="input-row">
                    <label>Scholarship Amount (in Ether):</label>
                    <input type="number" value={scholarshipAmount} onChange={(e) => setScholarshipAmount(e.target.value)} placeholder="Scholarship Amount" />
                </div>
                <div className="input-row">
                    <label>Maximum Limit:</label>
                    <input type="number" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="Maximum Limit" />
                </div>
                <div className="input-row">
                    <label>Description:</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description"></textarea>
                </div>
                <div className="input-row">
                    <label>Eligibility:</label>
                    <input type="text" value={eligibility} onChange={(e) => setEligibility(e.target.value)} placeholder="Eligibility Criteria" />
                </div>
                <button onClick={addScholarship}>Add Scholarship</button>
            </div>
            <Link to={`/scholarships?providerAddress=${account[0]}`} className="section-link">
                <div className="section">
                   <h2>Added Scholarships</h2>
                </div>
            </Link>
            <Link to={`/studentsapplied?providerAddress=${account[0]}`} className="section-link">
                <div className="section">
                    <h2>Students Applied</h2>
                </div>
            </Link>
            <Link to={`/acceptedstudents?providerAddress=${account[0]}`} className="section-link">
                <div className="section">
                    <h2>Accepted Students</h2>
                </div>
            </Link>
        </div>
    );
}

export default ScholarshipProviderDashboard;
