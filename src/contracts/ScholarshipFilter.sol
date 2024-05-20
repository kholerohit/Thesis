// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract ScholarshipFilter {
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

    ScholarshipDetails[] public scholarships;

    // Function to add scholarship details
    function addScholarshipDetails(
        uint id,
        address provider,
        string memory companyName,
        uint amount,
        string memory description,
        uint limit,
        uint numAcceptedStudents,
        string memory eligibilityCriteriaString
    ) public {
        scholarships.push(ScholarshipDetails({
            id: id,
            provider: provider,
            companyName: companyName,
            amount: amount,
            description: description,
            limit: limit,
            numAcceptedStudents: numAcceptedStudents,
            eligibilityCriteriaString: eligibilityCriteriaString
        }));
    }

    // Function to check if a scholarship meets the eligibility criteria specified by a student
    function meetsEligibilityCriteria(uint scholarshipId, string memory eligibilityCriteria) public view returns (bool) {
        for (uint i = 0; i < scholarships.length; i++) {
            if (scholarships[i].id == scholarshipId) {
                // Compare the eligibility criteria of the scholarship with the specified criteria
                if (keccak256(abi.encodePacked(scholarships[i].eligibilityCriteriaString)) == keccak256(abi.encodePacked(eligibilityCriteria))) {
                    return true;
                }
                break;
            }
        }
        return false;
    }

    // Function to get scholarships that meet the eligibility criteria specified by a student
    function getFilteredScholarships(string memory eligibilityCriteria) public view returns (ScholarshipDetails[] memory) {
        uint numFilteredScholarships = 0;
        
        // Count the number of filtered scholarships
        for (uint i = 0; i < scholarships.length; i++) {
            if (meetsEligibilityCriteria(scholarships[i].id, eligibilityCriteria)) {
                numFilteredScholarships++;
            }
        }

        // Create an array to hold the filtered scholarships
        ScholarshipDetails[] memory filteredScholarships = new ScholarshipDetails[](numFilteredScholarships);
        uint index = 0;

        // Populate the filtered scholarships array
        for (uint i = 0; i < scholarships.length; i++) {
            if (meetsEligibilityCriteria(scholarships[i].id, eligibilityCriteria)) {
                filteredScholarships[index] = scholarships[i];
                index++;
            }
        }

        return filteredScholarships;
    }
}

