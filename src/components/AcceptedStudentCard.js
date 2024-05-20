import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import ScholarshipContract from '../abis/Scholarship.json';
import './AcceptedStudentCard.css';

function AcceptedStudentCard({ student }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    //const [transferCompleted, setTransferCompleted] = useState(false);
    //const [fundAvailable, setFundAvailable] = useState(true); // State to track fund availability

    useEffect(() => {
       /* const initializeWeb3 = async () => {
            try {
                if (typeof window.ethereum !== 'undefined') {
                    const web3 = new Web3(window.ethereum);
                    await window.ethereum.enable();
                    const accounts = await web3.eth.getAccounts();
                    const networkId = await web3.eth.net.getId();
                    const deployedNetwork = ScholarshipContract.networks[networkId];
                    const contractInstance = new web3.eth.Contract(
                        ScholarshipContract.abi,
                        deployedNetwork && deployedNetwork.address,
                    );

                   if (contractInstance) {
                        // Check if transfer is complete
                        const isComplete = await contractInstance.methods.isTransferComplete(student.scholarshipId, student.studentAddress, accounts[0]).call();
                        setTransferCompleted(isComplete);
                  
                        // Check if funds are available for the provider
                        const isFundAvailable = await contractInstance.methods.isFundsAvailableForTheProvider(student.studentAddress, student.scholarshipId).call();
                        console.log(isFundAvailable)
                        setFundAvailable(isFundAvailable);
                    } else {
                        console.error('Contract instance is not initialized.');
                    }
                } else {
                    console.error('MetaMask extension is not installed.');
                }
            } catch (error) {
                console.error('Error initializing web3:', error);
            }
        };

        initializeWeb3();*/
    }, [student.studentAddress, student.scholarshipId]); // Run the effect when student address or scholarship ID changes

   /* const transferScholarship = async () => {
        try {
            setLoading(true);
            const web3 = new Web3(window.ethereum);
            const accounts = await web3.eth.getAccounts();
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = ScholarshipContract.networks[networkId];
            const contractInstance = new web3.eth.Contract(
                ScholarshipContract.abi,
                deployedNetwork && deployedNetwork.address,
            );

            await contractInstance.methods.transferScholarshipFromProviderToStudent(
                student.studentAddress,
                student.scholarshipId,
                student.amount
            ).send({ from: accounts[0] });

            setLoading(false);
            setTransferCompleted(true); // Set transfer completion state
        } catch (error) {
            console.error('Error transferring scholarship:', error);
            setLoading(false);
            setError('Failed to transfer scholarship');
        }
    };*/

    return (
        <div className="student-card">
            <p>Student Address: {student.studentAddress}</p>
            <p>Scholarship Id: {student.scholarshipId.toString()}</p>
            <p>Name: {student.name}</p>
            <p>Age: {student.age.toString()}</p>
            <p>Degree: {student.degree}</p>
            <p>Percentage: {student.percentage.toString()}</p>
            <p>Scholarship Amount given: {student.amount.toString()}</p>
            <p>Phone number: {student.phoneNumber}</p>
            {/*fundAvailable && !transferCompleted && ( // Conditionally render the button
                <button onClick={transferScholarship} disabled={loading}>
                    {loading ? 'Transferring...' : 'Transfer Scholarship'}
                </button>
            )*/}
            {/*error && <p style={{ color: 'red' }}>{error}</p>*/} 
        </div>
    );
}

export default AcceptedStudentCard;
