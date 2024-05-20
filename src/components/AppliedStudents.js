// AppliedStudents.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Web3 from 'web3';
import ScholarshipContract from '../abis/Scholarship.json';
import AppliedStudentBox from './AppliedStudentBox';
import './AppliedStudents.css';

function AppliedStudents() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const providerAddress = searchParams.get('providerAddress');

    useEffect(() => {
        loadAppliedStudents();
    }, []);

    const loadAppliedStudents = async () => {
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

            const appliedStudents = await contractInstance.methods.getAppliedStudents(providerAddress).call();
            console.log(appliedStudents)
            setStudents(appliedStudents);
            setLoading(false);
        } catch (error) {
            console.error('Error loading applied students:', error);
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Applied Students</h2>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="students-list">
                    {students.length > 0 ? (
                        students.map((student, index) => (
                            <AppliedStudentBox key={index} student={student} providerAddress={providerAddress} />
                        ))
                    ) : (
                        <p>No students have applied yet.</p>
                    )}
                </div>
            )}
            <Link to="/provider">Back to Dashboard</Link>
        </div>
    );
}

export default AppliedStudents;
