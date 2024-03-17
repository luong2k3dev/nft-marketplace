// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address to, uint amount) external;

    function decimals() external view returns (uint);
}

contract TokenSale {
    IERC20 token;
    uint tokenPrice = 10 ** 17; // 0.1 ETH
    address admin;

    constructor(address _token) {
        token = IERC20(_token);
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin is allowed");
        _;
    }

    event Purchase(address indexed buyer, uint256 amount);

    function purchase() public payable {
        require(msg.value >= tokenPrice, "Not enough money sent");
        uint tokensToTransfer = msg.value / tokenPrice;
        uint remainder = msg.value - tokensToTransfer * tokenPrice;
        token.transfer(msg.sender, tokensToTransfer * 10 ** token.decimals());
        payable(msg.sender).transfer(remainder);
        emit Purchase(msg.sender, tokensToTransfer * 10 ** token.decimals());
    }

    function withdrawEther() external onlyAdmin {
        payable(admin).transfer(address(this).balance);
    }
}
