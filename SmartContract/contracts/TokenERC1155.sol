// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";

contract MyERC1155Token is ERC1155, ERC1155Burnable {
    uint256 _currentTokenId = 0;
    mapping(uint256 => string) private _uris;

    constructor() ERC1155("https://ipfs.io/ipfs/.../{id}.json") {}

    function mint(string memory tokenUri, uint256 amount, address to) public {
        uint256 tokenId = _currentTokenId++;
        _mint(to, tokenId, amount, "");
        _uris[tokenId] = tokenUri;
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        return (_uris[tokenId]);
    }
}
