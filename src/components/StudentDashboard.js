import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { FaBell } from 'react-icons/fa';
import { useHistory, useLocation , Link} from 'react-router-dom'; 
import ScholarshipFilterContract from '../abis/ScholarshipFilter.json';
import AuthContract from '../abis/Auth.json';
import ScholarshipBox from './ScholarshipBox';
import './StudentDashboard.css';

function StudentDashboard() {
    const [scholarships, setScholarships] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(false);
    const [lastAcceptedScholarshipId, setLastAcceptedScholarshipId] = useState(null);
    const [acceptedScholarships, setAcceptedScholarships] = useState(() => {
        // Retrieve previously stored accepted scholarships from localStorage, default to an empty array if not present
        const storedScholarships = localStorage.getItem('acceptedScholarships');
        return storedScholarships ? JSON.parse(storedScholarships) : [];
    });
    const history = useHistory(); // Access the history object for navigation
    const location = useLocation(); // Use location hook to access location state

    const [eligibilityCriteria, setEligibilityCriteria] = useState(() => {
        // Retrieve eligibility criteria from location state if available, otherwise default to an empty string
        return location.state ? location.state.eligibilityCriteria : "";
    });
    useEffect(() => {
        loadScholarships();
    }, []);

    useEffect(() => {
        // Update eligibility criteria when location state changes
        if (location.state) {
            setEligibilityCriteria(location.state.eligibilityCriteria);
        }
    }, [location.state]);

    const loadScholarships = async () => {
        try {
            setLoading(true);
            const web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
            const accounts = await web3.eth.getAccounts();
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = ScholarshipFilterContract.networks[networkId];
            const contractInstance = new web3.eth.Contract(
                ScholarshipFilterContract.abi,
                deployedNetwork && deployedNetwork.address,
            );
            const scholarshipDetails = await contractInstance.methods.getFilteredScholarships(eligibilityCriteria).call({ from: accounts[0] });
            if (scholarshipDetails.length > 0) {
                setScholarships(scholarshipDetails);
            } else {
                console.warn('No scholarships available.');
            }

            setLoading(false);
        } catch (error) {
            console.error('Error loading scholarships:', error);
            setLoading(false);
        }
    };

    const handleAcceptedApplication = (scholarshipId, scholarship) => {
        // Check if the accepted scholarship is different from the last one
         // Convert BigInt values to strings or regular numbers before serialization
    const serializedScholarship = serializeScholarship(scholarship);
        if (scholarshipId !== lastAcceptedScholarshipId) {
            // Check if the scholarship already exists in the list
            const scholarshipExists = acceptedScholarships.some(existingScholarship => existingScholarship.Id === scholarshipId);

            if (!scholarshipExists) {
                // Add the new accepted scholarship to the array without modifying the existing array
                setAcceptedScholarships(prevAcceptedScholarships => [...prevAcceptedScholarships, { Id: scholarshipId, ...serializedScholarship  }]);
                // Save the updated accepted scholarships to localStorage
                localStorage.setItem('acceptedScholarships', JSON.stringify([...acceptedScholarships, { Id: scholarshipId, ...serializedScholarship  }]));
            }
            setNotification(true); // Set notification to true
            setLastAcceptedScholarshipId(scholarshipId); // Update the ID of the last accepted scholarship
        }
    };

    // Function to serialize scholarship object
const serializeScholarship = (scholarship) => {
    // Iterate through the object properties
    const serializedScholarship = {};
    for (const key in scholarship) {
        if (Object.hasOwnProperty.call(scholarship, key)) {
            const value = scholarship[key];
            // Convert BigInt values to strings or regular numbers
            if (typeof value === 'bigint') {
                serializedScholarship[key] = value.toString();
            } else {
                serializedScholarship[key] = value;
            }
        }
    }
    return serializedScholarship;
};
    const handleNotificationClick = () => {
        setNotification(false); // Reset notification state to false
        history.push({
            pathname: '/notifications',
            state: { acceptedScholarships: acceptedScholarships }
        });
    };
    
    const handleEligibilityCriteriaChange = (e) => {
        setEligibilityCriteria(e.target.value); // Update eligibility criteria state
    };

     const handleFilterScholarships = () => {
        loadScholarships(); 
        // Navigate to the current location with updated eligibility criteria in the location state
        history.push({
            pathname: location.pathname,
            state: { eligibilityCriteria: eligibilityCriteria }
        });
    };

    const handleLogout = async () => {
        try {
            setLoading(true);
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
            <h1>Student Dashboard</h1>
            <button onClick={handleLogout}>Logout</button> {/* Add a logout button */}
            <Link to="/certificate-request">
                <button>Get Certificate</button>
            </Link>
            <div>
                <input
                    type="text"
                    value={eligibilityCriteria}
                    onChange={handleEligibilityCriteriaChange}
                    placeholder="Enter eligibility criteria"
                />
                <button onClick={handleFilterScholarships}>Filter Scholarships</button>
            </div>
            <div className="notification-icon" onClick={handleNotificationClick}>
                <FaBell color={notification ? 'green' : 'black'} size={24} />
            </div>
            {loading ? (
                <p className="loading-message">Loading...</p>
            ) : (
                <div>
                    {scholarships.map((scholarship, index) => (
                        <ScholarshipBox
                            key={index}
                            Id={scholarship[0].toString()}
                            providerAddress={scholarship[1]}
                            companyName={scholarship[2]}
                            scholarshipAmount={scholarship[3].toString()}
                            description={scholarship[4]}
                            eligibility={scholarship.eligibilityCriteriaString} // Pass eligibility criteria to the ScholarshipBox
                            onAcceptedApplication={() => handleAcceptedApplication(scholarship[0].toString(), scholarship)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default StudentDashboard;
