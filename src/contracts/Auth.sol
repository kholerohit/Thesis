// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Auth {
    struct User {
        string username;
        string password; // In a real-world scenario, store a hashed version of the password
        string role;
        bool isLoggedIn;
    }

    mapping(address => User) public users;

    event UserLoggedIn(address userAddress, string role);
    event UserLoggedOut(address userAddress);

    function signup(string memory _username, string memory _password, string memory _role) public {
        require(bytes(_username).length > 0, "Username must not be empty");
        require(bytes(_password).length > 0, "Password must not be empty");
        require(bytes(_role).length > 0, "Role must not be empty");
        require(!users[msg.sender].isLoggedIn, "User is already logged in");

        users[msg.sender] = User(_username, _password, _role, true); // In real-world scenario, hash the password before storing
    }

    function login(string memory _username, string memory _password) public {
        require(bytes(_username).length > 0, "Username must not be empty");
        require(bytes(_password).length > 0, "Password must not be empty");
   
        User storage user = users[msg.sender];
        require(keccak256(bytes(user.username)) == keccak256(bytes(_username)), "Invalid username");
        require(keccak256(bytes(user.password)) == keccak256(bytes(_password)), "Invalid password");
        user.isLoggedIn = true;
        emit UserLoggedIn(msg.sender, user.role);
    }

    function logout() public {
        require(users[msg.sender].isLoggedIn, "User is not logged in");

        users[msg.sender].isLoggedIn = false;
        emit UserLoggedOut(msg.sender);
    }

    function getRole() public view returns (string memory) {
        return users[msg.sender].role;
    }

    function isLoggedIn() public view returns (bool) {
        return users[msg.sender].isLoggedIn;
    }
}
