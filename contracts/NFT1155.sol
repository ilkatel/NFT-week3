// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./interfaces/INFT1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFT1155 is INFT1155, ERC1155URIStorage, Ownable {
    string public name;
    string public symbol;
    uint public totalTokens;
    mapping(address => bool) public mintRights;
    mapping(uint256 => uint256) public tokenSupply;

    constructor(string memory _name, string memory _symbol) ERC1155("") {
        name = _name;
        symbol = _symbol;
        mintRights[_msgSender()] = true;
    }

    function totalSupply(uint256 _id) public view returns (uint256) {
        return tokenSupply[_id];
    }
    
    function changeRightsToMint(address _to) external override onlyOwner {
        mintRights[_to] = !mintRights[_to];
    }

    function mint(address _to, uint256 _amount, string memory _tokenURI) public override returns (uint256) {
        require(mintRights[_msgSender()], "Have no rights to mint!");
        require(_amount > 0, "Cant mint the null tokens!");
        // require(_to != address(0)); <- this do ERC1155

        uint256 id = totalTokens;
        totalTokens++;

        _mint(_to, id, _amount, "");
        tokenSupply[id] = _amount;
        _setURI(id, _tokenURI);

        return id;
    }
}
