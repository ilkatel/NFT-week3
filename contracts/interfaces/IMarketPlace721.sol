
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IMarketPlace721 {
    function createItem(string memory _tokenURI) external;
    function listItem(uint _itemId, uint _price) external;
    function buyItem(uint _itemId) external;
    function cancel(uint _itemId) external;
    function listItemOnAuction(uint _itemId, uint _startPrice) external;
    function makeBid(address _contract, uint _itemId, uint _value) external;
    function finishAuction(address _contract, uint _itemId) external;
}