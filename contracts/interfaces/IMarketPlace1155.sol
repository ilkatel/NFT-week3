
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IMarketPlace1155 {
    function createItem(uint _amount, string memory _tokenURI) external;
    function listItem(uint _itemId, uint _amount, uint _price) external;
    function buyItem(uint _index, uint _amount) external;
    function cancel(uint _index, uint _amount) external;
    function listItemOnAuction(uint _itemId, uint _amount, uint _startPrice) external;
    function makeBid(address _contract, uint _index, uint _value) external;
    function finishAuction(address _contract, uint _index) external;
}