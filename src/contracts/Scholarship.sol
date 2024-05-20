// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./ScholarshipFilter.sol"; // Import the ScholarshipFilter contract

contract Scholarship {

    struct ScholarshipProvider {
        uint scholarshipAmount;
    }

    struct ScholarshipDetails {
        uint id;
        address provider;
        string companyName;
        uint amount;
        string description;
        uint limit; // Maximum number of students that can be accepted
        uint numAcceptedStudents; // Number of students currently accepted
        string eligibilityCriteriaString; // String representation of eligibility criteria
    }

    struct AppliedScholarship {
        uint scholarshipId;
        uint amount;
        bool applied;
        bool accepted;
        address provider;
    }

    struct Student {
        address studentAddress;
        string name;
        string email;
        string phoneNumber; 
        mapping(address => AppliedScholarship[]) appliedScholarships;
    }

    struct ProviderDetails {
        ScholarshipProvider provider;
        address[] applicants;
        mapping(address => bool) acceptedStudents;
        uint totalScholarshipAmount;
    }

    struct AppliedStudentDetails {
        address studentAddress;
        address provider;
        uint scholarshipId;
        uint amount;
        string name;
        string email;
        string phoneNumber; 
    }

    mapping(address => ProviderDetails) public scholarshipProviders;
    mapping(address => Student) public students;
    address[] public providerAddresses;
    ScholarshipDetails[] public scholarships;
    mapping(address => uint) public providerLastScholarshipId;
    address[] public acceptedStudents;
    mapping(address => mapping(address => uint[])) public providerAppliedScholarships;
    mapping(uint => mapping(address => mapping(address => bool))) public transferCompleted;
    mapping(address => mapping(uint => string)) public scholarshipProofs;

    event ProofUploaded(address indexed studentAddress, uint indexed scholarshipId, string proof);
    event TransferCompleted(address indexed studentAddress, address indexed providerAddress, uint scholarshipId);
    event ScholarshipApplied(address indexed student, address indexed provider, uint scholarshipId, uint scholarshipAmount);
    event ScholarshipAccepted(address indexed student, address indexed provider, uint scholarshipId, uint scholarshipAmount);
    event ScholarshipAdded(uint indexed scholarshipId, address indexed provider, string companyName, uint amount, string description);
    event ScholarshipTransferred(address indexed student, address indexed provider, uint scholarshipId, uint scholarshipAmount);
    event ScholarshipRejected(address indexed student, address indexed provider);

    function uploadProof(uint scholarshipId, string memory proof) public {
        address studentAddress = msg.sender;
        scholarshipProofs[studentAddress][scholarshipId] = proof;
        emit ProofUploaded(studentAddress, scholarshipId, proof);
    }

    function getProofForScholarship(address studentAddress, uint scholarshipId) public view returns (string memory) {
        return scholarshipProofs[studentAddress][scholarshipId];
    }

    address public scholarshipFilterAddress;

    constructor(address _scholarshipFilterAddress) {
        scholarshipFilterAddress = _scholarshipFilterAddress;
    }

    function addScholarshipDetailsToFilter(
        uint id,
        address provider,
        string memory companyName,
        uint amount,
        string memory description,
        uint limit,
        uint numAcceptedStudents,
        string memory eligibilityCriteriaString
    ) internal {
        ScholarshipFilter(scholarshipFilterAddress).addScholarshipDetails(
            id,
            provider,
            companyName,
            amount,
            description,
            limit,
            numAcceptedStudents,
            eligibilityCriteriaString
        );
    }

    function addScholarship(
    uint amount,
    string memory description,
    string memory companyName,
    uint limit,
    string memory eligibilityCriteriaString 
    ) public {
        require(amount > 0, "Invalid scholarship amount");
        address provider = msg.sender;
        providerLastScholarshipId[provider]++;
        uint scholarshipId = providerLastScholarshipId[provider];
        uint totalAmount = amount * limit; 
        scholarships.push(ScholarshipDetails({
            id: scholarshipId,
            provider: msg.sender,
            companyName: companyName,
            amount: amount,
            description: description,
            limit: limit,
            numAcceptedStudents: 0,
            eligibilityCriteriaString: eligibilityCriteriaString 
        }));

        addScholarshipDetailsToFilter(
            scholarshipId,
            provider,
            companyName,
            amount,
            description,
            limit,
            0,
            eligibilityCriteriaString
        );
        scholarshipProviders[msg.sender].provider.scholarshipAmount = amount;
        scholarshipProviders[msg.sender].totalScholarshipAmount += totalAmount; 
        emit ScholarshipAdded(scholarshipId, msg.sender, companyName, amount, description);
        bool exists = false;
        for (uint i = 0; i < providerAddresses.length; i++) {
            if (providerAddresses[i] == provider) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            providerAddresses.push(provider);
        }
    }

    function applyForScholarship(
        address providerAddress,
        uint scholarshipId,
        string memory studentName,
        string memory email,
        string memory studentPhoneNumber, 
        uint scholarshipAmount
    ) public {

        ProviderDetails storage providerDetails = scholarshipProviders[providerAddress];
        Student storage student = students[msg.sender];
        student.studentAddress = msg.sender;
        student.name = studentName;
        student.phoneNumber = studentPhoneNumber;
        student.email = email;
        AppliedScholarship memory newAppliedScholarship = AppliedScholarship({
            scholarshipId: scholarshipId,
            amount: scholarshipAmount,
            applied: true,
            accepted: false,
            provider: providerAddress
        });

        student.appliedScholarships[providerAddress].push(newAppliedScholarship);
        providerDetails.applicants.push(msg.sender);
        providerAppliedScholarships[providerAddress][msg.sender].push(scholarshipId); 
        emit ScholarshipApplied(msg.sender, providerAddress, scholarshipId, scholarshipAmount);
    }

function acceptStudent(address providerAddress, address studentAddress, uint scholarshipId) public {
    Student storage student = students[studentAddress];
    ProviderDetails storage providerDetails = scholarshipProviders[providerAddress];
    require(student.appliedScholarships[providerAddress].length > 0, "Student has not applied for this scholarship");

    uint scholarshipAmount;
    uint indexToRemove;
    AppliedScholarship[] storage appliedScholarships = student.appliedScholarships[providerAddress];
    for (uint i = 0; i < appliedScholarships.length; i++) {
        if (appliedScholarships[i].scholarshipId == scholarshipId && appliedScholarships[i].applied) {
            scholarshipAmount = appliedScholarships[i].amount;
            indexToRemove = i;
            break;
        }
    }
    require(scholarshipAmount > 0, "Student has not applied for this scholarship");

    // Check if scholarship limit is reached
    uint scholarshipIndex;
    for (uint i = 0; i < scholarships.length; i++) {
        if (scholarships[i].id == scholarshipId) {
            scholarshipIndex = i;
            require(scholarships[i].numAcceptedStudents < scholarships[i].limit, "Scholarship limit reached");
            scholarships[i].numAcceptedStudents++;
            break;
        }
    }

    // Move the student from applied to accepted list
    acceptedStudents.push(studentAddress);

    providerDetails.acceptedStudents[studentAddress] = true;
    appliedScholarships[indexToRemove].accepted = true;
    appliedScholarships[indexToRemove].applied = false; // Mark the scholarship as not applied
    scholarshipProviders[providerAddress].totalScholarshipAmount -=  appliedScholarships[indexToRemove].amount; 
    emit ScholarshipAccepted(studentAddress, providerAddress, scholarshipId, scholarshipAmount);
}

function getAppliedStudents(address providerAddress) external view returns (AppliedStudentDetails[] memory) {
    ProviderDetails storage providerDetails = scholarshipProviders[providerAddress];
    uint numApplicants = providerDetails.applicants.length;
    AppliedStudentDetails[] memory appliedStudents = new AppliedStudentDetails[](numApplicants);
    uint numAppliedStudents = 0; // Counter to track the number of applied students

    for (uint i = 0; i < numApplicants; i++) {
        address studentAddress = providerDetails.applicants[i];
        Student storage student = students[studentAddress];
        AppliedScholarship[] storage appliedScholarships = student.appliedScholarships[providerAddress];

        for (uint j = 0; j < appliedScholarships.length; j++) {
            AppliedScholarship storage appliedScholarship = appliedScholarships[j];

            // Check if the scholarship is applied and has not been added for this student before
            bool alreadyAdded = false;
            for (uint k = 0; k < numAppliedStudents; k++) {
                if (appliedStudents[k].studentAddress == studentAddress && appliedStudents[k].scholarshipId == appliedScholarship.scholarshipId) {
                    alreadyAdded = true;
                    break;
                }
            }

            if (appliedScholarship.applied && !alreadyAdded) {
                // Add applied scholarship details to the array
                appliedStudents[numAppliedStudents] = AppliedStudentDetails({
                    studentAddress: studentAddress,
                    provider: providerAddress,
                    scholarshipId: appliedScholarship.scholarshipId,
                    amount: appliedScholarship.amount,
                    name: student.name,
                    email: student.email,
                    phoneNumber: student.phoneNumber
                });
                numAppliedStudents++;
            }
        }
    }

    // Resize the array to remove any unused slots
    if (numAppliedStudents < appliedStudents.length) {
        AppliedStudentDetails[] memory trimmedArray = new AppliedStudentDetails[](numAppliedStudents);
        for (uint k = 0; k < numAppliedStudents; k++) {
            trimmedArray[k] = appliedStudents[k];
        }
        appliedStudents = trimmedArray;
    }

    return appliedStudents;
}



// Function to check if a scholarship ID is already added
function isScholarshipIdAdded(uint[] memory addedScholarshipIds, uint scholarshipId) internal pure returns (bool) {
    for (uint i = 0; i < addedScholarshipIds.length; i++) {
        if (addedScholarshipIds[i] == scholarshipId) {
            return true;
        }
    }
    return false;
}

function getAcceptedStudents(address providerAddress) external view returns (AppliedStudentDetails[] memory) {
    uint numAcceptedStudents = acceptedStudents.length;
    AppliedStudentDetails[] memory acceptedStudentsArray = new AppliedStudentDetails[](numAcceptedStudents);
    uint numAcceptedStudentsForProvider = 0;

    for (uint i = 0; i < numAcceptedStudents; i++) {
        address studentAddress = acceptedStudents[i];
        Student storage student = students[studentAddress];

        // Iterate over applied scholarships for this student
        for (uint j = 0; j < student.appliedScholarships[providerAddress].length; j++) {
            AppliedScholarship storage appliedScholarship = student.appliedScholarships[providerAddress][j];
            if (appliedScholarship.accepted && appliedScholarship.provider == providerAddress) {
                acceptedStudentsArray[numAcceptedStudentsForProvider] = AppliedStudentDetails({
                    studentAddress: studentAddress,
                    provider: providerAddress,
                    scholarshipId: appliedScholarship.scholarshipId,
                    amount: appliedScholarship.amount,
                    name: student.name,
                    email: student.email,
                    phoneNumber: student.phoneNumber
                });
                numAcceptedStudentsForProvider++;
            }
        }
    }

    // Resize the array to remove empty slots
    if (numAcceptedStudentsForProvider < numAcceptedStudents) {
        AppliedStudentDetails[] memory trimmedArray = new AppliedStudentDetails[](numAcceptedStudentsForProvider);
        for (uint k = 0; k < numAcceptedStudentsForProvider; k++) {
            trimmedArray[k] = acceptedStudentsArray[k];
        }
        acceptedStudentsArray = trimmedArray;
    }

    return acceptedStudentsArray;
}


    function getScholarships(address providerAddress) external view returns (ScholarshipDetails[] memory) {
        uint length = scholarships.length;
        ScholarshipDetails[] memory scholarshipsArray = new ScholarshipDetails[](length);
        uint numScholarships = 0;

        for (uint i = 0; i < length; i++) {
            if (scholarships[i].provider == providerAddress) {
                scholarshipsArray[numScholarships] = scholarships[i];
                numScholarships++;
            }
        }

        if (numScholarships < length) {
            assembly {
                mstore(scholarshipsArray, numScholarships)
            }
        }

        return scholarshipsArray;
    }

    function getAllScholarships() external view returns (ScholarshipDetails[] memory) {
        return scholarships;
    }

    function hasStudentAppliedForScholarship(address studentAddress, address providerAddress, uint scholarshipId) external view returns (bool) {
        AppliedScholarship[] memory appliedScholarships = students[studentAddress].appliedScholarships[providerAddress];

        for (uint i = 0; i < appliedScholarships.length; i++) {
            if (appliedScholarships[i].scholarshipId == scholarshipId && appliedScholarships[i].applied) {
                return true;
            }
        }

        return false;
    }

    function hasStudentAcceptedScholarship(address studentAddress, address providerAddress, uint scholarshipId) external view returns (bool) {
        AppliedScholarship[] memory appliedScholarships = students[studentAddress].appliedScholarships[providerAddress];

        for (uint i = 0; i < appliedScholarships.length; i++) {
            if (appliedScholarships[i].scholarshipId == scholarshipId && appliedScholarships[i].accepted) {
                return true;
            }
        }

        return false;
    }
function rejectStudent(address providerAddress, address studentAddress, uint scholarshipId) public {
    ProviderDetails storage providerDetails = scholarshipProviders[providerAddress];
    Student storage student = students[studentAddress];
    AppliedScholarship[] storage appliedScholarships = student.appliedScholarships[providerAddress];

    uint rejectedIndex; // Index of the rejected scholarship in the applied scholarships array
    bool isRejectedInRemainingScholarships = false;

    for (uint i = 0; i < appliedScholarships.length; i++) {
        if (appliedScholarships[i].scholarshipId == scholarshipId) {
            // Mark the rejected scholarship as not applied
            appliedScholarships[i].applied = false;
            // Set certain fields to null or zero
            appliedScholarships[i].provider = address(0);
            appliedScholarships[i].amount = 0;
            appliedScholarships[i].scholarshipId = 0;
            rejectedIndex = i;
            break;
        }
    }

    // Remove the student from the list of applicants for this provider
    for (uint i = 0; i < providerDetails.applicants.length; i++) {
        if (providerDetails.applicants[i] == studentAddress) {
            for (uint j = i; j < providerDetails.applicants.length - 1; j++) {
                providerDetails.applicants[j] = providerDetails.applicants[j + 1];
            }
            providerDetails.applicants.pop();
            break;
        }
    }

    // Check if the rejected scholarship is in the remaining scholarship array
    for (uint i = 0; i < providerAppliedScholarships[providerAddress][studentAddress].length; i++) {
        if (providerAppliedScholarships[providerAddress][studentAddress][i] == scholarshipId) {
            isRejectedInRemainingScholarships = true;
            // Remove the rejected scholarship from the remaining scholarship array
            for (uint j = i; j < providerAppliedScholarships[providerAddress][studentAddress].length - 1; j++) {
                providerAppliedScholarships[providerAddress][studentAddress][j] = providerAppliedScholarships[providerAddress][studentAddress][j + 1];
            }
            providerAppliedScholarships[providerAddress][studentAddress].pop();
            break;
        }
    }

    // If the rejected scholarship is not in the remaining scholarship array,
    // add the next applied scholarship (if any) to the remaining scholarship array
    if (!isRejectedInRemainingScholarships && rejectedIndex < appliedScholarships.length - 1) {
        uint nextScholarshipId = appliedScholarships[rejectedIndex + 1].scholarshipId;
        providerAppliedScholarships[providerAddress][studentAddress].push(nextScholarshipId);
    }

    emit ScholarshipRejected(studentAddress, providerAddress);
}


    // Function to transfer scholarship from provider to student
    //function transferScholarshipFromProviderToStudent(address studentAddress, uint scholarshipId, uint amount) public {
        //address providerAddress = msg.sender;
        //scholarshipProviders[providerAddress].provider.scholarshipAmount -= amount;
        //scholarshipProviders[providerAddress].totalScholarshipAmount -= amount; // Update total scholarship amount for the provider

        // Mark scholarship transfer as completed
       // transferCompleted[scholarshipId][studentAddress][providerAddress] = true;
        //emit TransferCompleted(studentAddress, providerAddress, scholarshipId);
    //}

    // Function to check if scholarship transfer is complete for a given scholarship ID, student address, and provider address
   // function isTransferComplete(uint scholarshipId, address studentAddress, address providerAddress) public view returns (bool) {
      //  return transferCompleted[scholarshipId][studentAddress][providerAddress];
   // }
    
function isFundsAvailableForTheProvider(address studentAddress, uint scholarshipId) public returns (bool) {
    address providerAddress = msg.sender;
    uint availableAmount = scholarshipProviders[providerAddress].totalScholarshipAmount;

    AppliedScholarship[] storage appliedScholarships = students[studentAddress].appliedScholarships[providerAddress];
    for (uint i = 0; i < appliedScholarships.length; i++) {
        AppliedScholarship storage appliedScholarship = appliedScholarships[i];

        if (appliedScholarship.scholarshipId == scholarshipId && appliedScholarship.accepted) {
            uint scholarshipAmount = appliedScholarship.amount;

            if (scholarshipAmount > availableAmount) {
                appliedScholarship.accepted = false;
                return false;
            }
        }
    }

    return true;
}
    
 // Function to get remaining applied scholarships after the first one from a given provider for a specific student
function remainingApplied(address providerAddress, address studentAddress) public view returns (uint[] memory) {
    uint[] memory remainingScholarships = new uint[](providerAppliedScholarships[providerAddress][studentAddress].length - 1);

    for (uint i = 1; i < providerAppliedScholarships[providerAddress][studentAddress].length; i++) {
        remainingScholarships[i - 1] = providerAppliedScholarships[providerAddress][studentAddress][i];
    }

    return remainingScholarships;
}

// Function to check if a student's applied scholarship is accepted by any provider
function isStudentScholarshipAccepted(address studentAddress) public view returns (address) {
    Student storage student = students[studentAddress];
    for (uint i = 0; i < providerAddresses.length; i++) {
        address providerAddress = providerAddresses[i];
        for (uint j = 0; j < student.appliedScholarships[providerAddress].length; j++) {
            if (student.appliedScholarships[providerAddress][j].accepted) {
                return student.appliedScholarships[providerAddress][j].provider;
            }
        }
    }
    return address(0); // Return null if no accepted scholarship is found for the student
}



// Function to get the content of the acceptedStudents array
    function getAllAcceptedStudents() public view returns (address[] memory) {
        return acceptedStudents;
    }

function isScholarshipLimitReached(uint scholarshipId) public view returns (bool) {
    for (uint i = 0; i < scholarships.length; i++) {
        if (scholarships[i].id == scholarshipId) {
            return scholarships[i].numAcceptedStudents >= scholarships[i].limit;
        }
    }
    return false;
}
 function getAvailableScholarshipAmount(address providerAddress) public view returns (uint) {
        return scholarshipProviders[providerAddress].totalScholarshipAmount;
    }
}