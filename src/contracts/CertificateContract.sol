// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertificateContract {

    struct CertificateRequest {
        uint id;
        address requester;  // Store the requester's address instead of name
        string publicKey;
        string[] encryptedFiles;
        string certificateContent;
        string encryptedSymmetricKey;
        bool approved;
    }

    mapping(uint => CertificateRequest) public requests;
    uint public requestCounter;
    string public caPublicKey;
    event CertificateRequested(uint indexed id, address indexed requester);
    event CertificateApproved(uint indexed id, address indexed requester, string certificateContent);

    mapping(address => uint256) public requestIdByAddress;

     mapping(address => string[]) public certificateRecords;

  function setCertificateHash(
    address studentAddress, 
    string memory hash1, 
    string memory hash2, 
    string memory hash3, 
    string memory hash4
) public {
    string[] memory hashes = new string[](4);
    hashes[0] = hash1;
    hashes[1] = hash2;
    hashes[2] = hash3;
    hashes[3] = hash4;
    // Update the certificateRecords mapping
    certificateRecords[studentAddress] = hashes;
}

 // Function to get the certificate hash for a specific student address
    function getCertificateHash(address studentAddress) public view returns (string[] memory) {
        return certificateRecords[studentAddress];
    }
    
    function requestCertificate(
        string memory _publicKey, string[] memory _encryptedFiles, string memory encryptedSymmetricKey
    ) public {
        requestCounter++;
        CertificateRequest storage req = requests[requestCounter];
        req.id = requestCounter;
        req.approved = false;
        req.certificateContent = "";
        req.publicKey = _publicKey; // Store the public key
        req.requester = msg.sender; // Store the sender's address
        req.encryptedSymmetricKey = encryptedSymmetricKey;
        requests[requestCounter] = CertificateRequest(requestCounter, msg.sender, _publicKey, _encryptedFiles, "", encryptedSymmetricKey,false);
        emit CertificateRequested(requestCounter, msg.sender);
        requestIdByAddress[msg.sender] = requestCounter;
    }

    function approveRequest(uint _requestId, string memory _certificateContent) public {
        requests[_requestId].approved = true;
        requests[_requestId].certificateContent = _certificateContent;
        emit CertificateApproved(_requestId, requests[_requestId].requester, _certificateContent);
    }

    function getCertificate(uint _requestId) public view returns (string memory) {
        require(requests[_requestId].id != 0, "Request does not exist");
        require(requests[_requestId].approved, "Certificate not yet approved");
        return requests[_requestId].certificateContent;
    }

    function getRequest(uint _requestId) public view returns (CertificateRequest memory) {
        require(requests[_requestId].id != 0, "Request does not exist");
        return requests[_requestId];
    }

    function getCAPublicKey() public view returns (string memory) {
        return caPublicKey;
    }

    function setCAPublicKey(string memory _caPublicKey) public {
        caPublicKey = _caPublicKey;
    }

    function getRequestCounter() public view returns (uint) {
        return requestCounter;
    }

    function getRequestId(address requester) public view returns (uint256) {
        return requestIdByAddress[requester];
    }

    function getRequestPublicKey(uint _requestId) public view returns (string memory) {
        require(requests[_requestId].id != 0, "Request does not exist");
        return requests[_requestId].publicKey;
    }
}
