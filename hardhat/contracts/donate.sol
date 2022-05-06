// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract Donation is ERC721, Ownable{
    address public _owner;
    uint public totalDonated;
    uint public totalDonors;
    address[] public donorsAddress;
    event Log(address sender, uint amount);
    uint public tokenIds;
    string _baseTokenURI;



    constructor(string memory baseURI) ERC721("Ukraine Relief", "UKR") {
        _owner = msg.sender;
        _baseTokenURI = baseURI;
        
    }

    function donate() public payable{
        require(msg.value > 0, "Invalid amount");
        
        totalDonated += msg.value;
        totalDonors += 1;
        donorsAddress.push(msg.sender);
        mint(msg.sender);

        emit Log(msg.sender, msg.value);    
        
    }

    function mint(address sender) internal {

        tokenIds += 1;

        _safeMint(sender, tokenIds);

    }



    function getDonation() public view returns(uint){
        return totalDonated;
    }

    function getDonors() public view returns(uint){
        return totalDonors;
    }
    
    function withdrawFunds() onlyOwner public{
        // gets the amount stored in this contract
        uint donations = address(this).balance;

        //Send all ether to the owner
        (bool success, ) = _owner.call{value: donations}("");
        require(success, "Failed to send Ether");
    }


    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public override onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        // _transferOwnership(newOwner);
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }

    function owner() public view override returns (address) {
        return _owner;
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}




}

