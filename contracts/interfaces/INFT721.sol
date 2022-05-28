
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface INFT721 is IERC721 {
    function changeRightsToMint(address _to) external;
    function mint(address _to, string memory _tokenURI) external returns (uint);
}