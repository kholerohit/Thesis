// Signup.js
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Web3 from 'web3';
import './Signup.css'; // Import CSS file
import AuthContract from '../abis/Auth.json';

function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const history = useHistory();

  const handleSignup = async () => {
    try {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = AuthContract.networks[networkId];
      const contractInstance = new web3.eth.Contract(
        AuthContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Call the smart contract function to signup
      await contractInstance.methods.signup(username, password, role).send({ from: window.ethereum.selectedAddress });

      // Redirect to login after signup
      history.push('/');
    } catch (error) {
      console.error('Error signing up:', error);
      alert('Error signing up. Please try again.');
    }
  };

  return (
    <div className="signup-container">
      <h1>Signup Page</h1>
      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="">Select Role</option>
        <option value="student">Student</option>
        <option value="provider">Scholarship Provider</option>
        <option value="certificate authority">Certificate Authority</option>
      </select>
      <button onClick={handleSignup}>Signup</button>
    </div>
  );
}

export default Signup;
