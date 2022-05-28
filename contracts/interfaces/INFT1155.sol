
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

interface INFT1155 is IERC1155 {
    function changeRightsToMint(address _to) external;
    function mint(address _to, uint _amount, string memory _tokenURI) external returns (uint);
}