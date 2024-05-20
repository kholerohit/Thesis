import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Web3 from 'web3';
import ScholarshipContract from '../abis/Scholarship.json';
import AcceptedStudentCard from './AcceptedStudentCard';
import './AcceptedStudents.css';

function AcceptedStudents() {
    const [acceptedStudents, setAcceptedStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const providerAddress = searchParams.get('providerAddress');

    useEffect(() => {
        loadAcceptedStudents();
    }, [providerAddress]);

    const loadAcceptedStudents = async () => {
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

            const acceptedStudents = await contractInstance.methods.getAcceptedStudents(providerAddress).call({ from: accounts[0] });
            setAcceptedStudents(acceptedStudents);
            setLoading(false);
        } catch (error) {
            console.error('Error loading accepted students:', error);
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Accepted Students</h2>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="accepted-students-list">
                    {acceptedStudents.length > 0 ? (
                        acceptedStudents.map((student, index) => (
                            <AcceptedStudentCard key={index} student={student} />
                        ))
                    ) : (
                        <p>No students have been accepted yet.</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default AcceptedStudents;
