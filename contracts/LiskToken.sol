// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LiskToken is ERC20 {
    address public owner;

    constructor(uint256 initialSupply) ERC20("LiskToken", "LSK") {
       owner = msg.sender;
        _mint(owner, initialSupply * 10**18);
    }

    function mint(uint256 amount) external {
    require(msg.sender == owner, "Only owner can mint");
    _mint(msg.sender, amount * 10**18);  // Mint tokens to the owner's address
    }

}