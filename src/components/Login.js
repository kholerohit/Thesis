// Login.js
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import './Login.css'; // Import CSS file
import Web3 from 'web3';
import AuthContract from '../abis/Auth.json';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const history = useHistory();
  const handleSignup = () => {
    history.push('/signup');
  };
  const handleLogin = async () => {
    try {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = AuthContract.networks[networkId];
      const contractInstance = new web3.eth.Contract(
        AuthContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
     
      // Call the smart contract function to log in
      await contractInstance.methods.login(username, password).send({ from: window.ethereum.selectedAddress });

      // Redirect based on role after login
      const userRole = await contractInstance.methods.getRole().call({ from: window.ethereum.selectedAddress });
      if (userRole === 'student') {
        history.push('/student');
      } else if (userRole === 'provider') {
        history.push('/provider');
      } else if (userRole == 'certificate authority'){
        history.push('./certificateAuthority')
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Error logging in. Please check your credentials and try again.');
    }
  };

  return (
    <div className="login-container">
      <h1>Login Page</h1>
      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleSignup}>Signup</button>
    </div>
  );
}

export default Login;

