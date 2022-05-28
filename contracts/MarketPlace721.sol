// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./BaseMP.sol";
import "./interfaces/IMarketPlace721.sol";

contract MarketPlace721 is BaseMP, IMarketPlace721 {  

    function createItem(string memory _tokenURI) external override {
        nft721.mint(_msgSender(), _tokenURI);
    }

    function listItem(uint _itemId, uint _price) external override {
        require(_price > 0, "Price cant be null");

        nft721.safeTransferFrom(_msgSender(), address(this), _itemId);

        sales[address(nft721)][_itemId].owner = _msgSender();
        sales[address(nft721)][_itemId].price = _price;
    }

    function buyItem(uint _itemId) external override {
        require(sales[address(nft721)][_itemId].price > 0, "Item not found!");

        uint price = sales[address(nft721)][_itemId].price;
        uint comission = _calcComission(price);

        erc20.transferFrom(_msgSender(), owner(), comission);
        erc20.transferFrom(_msgSender(), sales[address(nft721)][_itemId].owner, price - comission);
        nft721.safeTransferFrom(address(this), _msgSender(), _itemId);

        delete sales[address(nft721)][_itemId];
    }

    function cancel(uint _itemId) external override {
        require(sales[address(nft721)][_itemId].owner == _msgSender(), "You are not an owner!");
        delete sales[address(nft721)][_itemId];
        nft721.safeTransferFrom(address(this), _msgSender(), _itemId);
    }

    function listItemOnAuction(uint _itemId, uint _startPrice) external override {
        require(_startPrice > 0, "Start price cant be null");

        nft721.safeTransferFrom(_msgSender(), address(this), _itemId);

        auctions[address(nft721)][_itemId].info.owner = _msgSender();
        auctions[address(nft721)][_itemId].info.price = _startPrice;
        auctions[address(nft721)][_itemId].finishTime = auctionDuration + block.timestamp;
    }

    function makeBid(address _contract, uint _itemId, uint _value) external override {
        require(auctions[address(nft721)][_itemId].finishTime > block.timestamp, "Cant find activity auction!");
        require(auctions[address(nft721)][_itemId].info.owner != _msgSender(), "Owner cant bid!");
        require(auctions[address(nft721)][_itemId].info.price < _value, "Value below the minimum price!");
        require(auctions[address(nft721)][_itemId].lastBidder != _msgSender(), "Cant bid twice in a row!");

        erc20.transferFrom(_msgSender(), address(this), _value);
        if (auctions[address(nft721)][_itemId].bids > 0)
            erc20.transfer(auctions[address(nft721)][_itemId].lastBidder, auctions[address(nft721)][_itemId].info.price);

        auctions[address(nft721)][_itemId].info.price = _value;
        auctions[address(nft721)][_itemId].lastBidder = _msgSender();
        auctions[address(nft721)][_itemId].bids++;
    }

    function finishAuction(address _contract, uint _itemId) external override {
        require(auctions[address(nft721)][_itemId].info.price > 0, "Cant find auction!");
        require(auctions[address(nft721)][_itemId].finishTime < block.timestamp, "Cant finish yet!");

        Auction memory _auction = auctions[address(nft721)][_itemId];
        delete auctions[address(nft721)][_itemId];
        uint bids = _auction.bids;
        address _owner = _auction.info.owner;
        
        if (bids > 0){
            address lastBidder = _auction.lastBidder;
            uint price = _auction.info.price;

            if (bids > 2) {
                uint comission = _calcComission(price);
                erc20.transfer(owner(), comission);
                erc20.transfer(_owner, price - comission);
                nft721.safeTransferFrom(address(this), lastBidder, _itemId);
                return;
            } 
            erc20.transfer(lastBidder, price);
        }
       
        nft721.safeTransferFrom(address(this), _owner, _itemId);
    }
}   