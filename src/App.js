import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import ScholarshipProviderDashboard from './components/ScholarshipProviderDashboard';
import ApplyForm from './components/ApplyForm';
import AddedScholarships from './components/AddedScholarships';
import AppliedStudents from './components/AppliedStudents';
import AcceptedStudents from './components/AcceptedStudents';
import NotificationPage from './components/NotificationPage';
import Signup from './components/Signup';
import PrivateRoute from './components/PrivateRoute';
import CertificateComponent from './components/CertificateComponent';
import AuthContract from './abis/Auth.json';
import Web3 from 'web3';
import CertificateAuthority from './components/CertificateAuthority';
import GenerateCertificate from './components/GenerateCertificate';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuthentication() {
      try {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = AuthContract.networks[networkId];
        const contractInstance = new web3.eth.Contract(
          AuthContract.abi,
          deployedNetwork && deployedNetwork.address,
        );

        // Check if user is logged in
        const isLoggedIn = await contractInstance.methods.isLoggedIn().call({ from: window.ethereum.selectedAddress });
        setIsAuthenticated(isLoggedIn);
        console.log(isLoggedIn)
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    }

    checkAuthentication();
  }, []);

  return (
    <Router>
      <div>
        <Switch>
          <Route path="/" exact component={Login} />
          <PrivateRoute path="/student" component={StudentDashboard} isAuthenticated={isAuthenticated}/>
          <PrivateRoute path="/provider" component={ScholarshipProviderDashboard} isAuthenticated={isAuthenticated}/>
          <Route path="/scholarships" component={AddedScholarships} />
          <Route path="/studentsapplied" component={AppliedStudents} />
          <Route path="/apply" component={ApplyForm}  />
          <Route path="/acceptedstudents" component={AcceptedStudents} />
          <Route path="/notifications" component={NotificationPage} />
          <Route path="/Signup" component={Signup} />
          <Route path="/certificate-request" component={CertificateComponent} />
          <Route path="/certificateAuthority" component={CertificateAuthority} />
          <Route path="/form" component={GenerateCertificate} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
