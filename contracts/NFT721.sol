// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./interfaces/INFT721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFT721 is INFT721, ERC721URIStorage, Ownable {

    uint public totalSupply;
    mapping(address => bool) public mintRights;

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {
        mintRights[_msgSender()] = true;
    }   

    function changeRightsToMint(address _to) external override onlyOwner {
        mintRights[_to] = !mintRights[_to];
    }

    function mint(address _to, string memory _tokenURI) public override returns (uint) {
        require(mintRights[_msgSender()], "Have no rights to mint!");

        uint id = totalSupply;
        totalSupply++;
        
        _safeMint(_to, id);
        _setTokenURI(id, _tokenURI);
        
        return id;
    }
}
