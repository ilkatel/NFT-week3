// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/INFT721.sol";
import "./interfaces/INFT1155.sol";

contract BaseMP is Ownable {  

    struct Sale {
        address owner;
        uint price;
        uint amount;
        uint itemId;
    } 

    struct Auction {
        Sale info;
        address lastBidder;
        uint96 bids;
        uint finishTime;
    }

    IERC20 public erc20;
    INFT721 public nft721;
    INFT1155 public nft1155;

    mapping(address => mapping(uint => Sale)) public sales;
    mapping(address => mapping(uint => Auction)) public auctions;
    uint public auctionDuration;
    uint public curretnIndex1155;

    function _calcComission(uint _value) internal pure returns (uint) {
        return _value == 0 ? 0 : (_value * 3) / 100;
    }
}   