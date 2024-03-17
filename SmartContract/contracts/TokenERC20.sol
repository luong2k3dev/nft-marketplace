// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyERC20Token is ERC20 {
    address public admin;

    constructor(uint256 _initialSupply) ERC20("MyERC20Token", "MET20") {
        admin = msg.sender;
        _mint(admin, _initialSupply * 10 ** 18);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only owner is allowed");
        _;
    }

    function mint(address account, uint256 amount) external onlyAdmin {
        _mint(account, amount);
    }
}
