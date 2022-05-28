// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./BaseMP.sol";
import "./interfaces/IMarketPlace1155.sol";

contract MarketPlace1155 is BaseMP, IMarketPlace1155 {  

    function createItem(uint _amount, string memory _tokenURI) external override {
        nft1155.mint(_msgSender(), _amount, _tokenURI);
    }

    function listItem(uint _itemId, uint _amount, uint _price) external override {
        require(_price > 0, "Price cant be null");
        require(_amount > 0, "Amount cant be null");

        nft1155.safeTransferFrom(_msgSender(), address(this), _itemId, _amount, "");
        uint index = curretnIndex1155;
        curretnIndex1155++;

        sales[address(nft1155)][index].owner = _msgSender();
        sales[address(nft1155)][index].price = _price;
        sales[address(nft1155)][index].amount = _amount;
        sales[address(nft1155)][index].itemId = _itemId;
    }

    function buyItem(uint _index, uint _amount) external override {
        require(sales[address(nft1155)][_index].price > 0, "Item not found!");
        require(_amount > 0, "Cant buy zero items!");

        uint availableAmount = sales[address(nft1155)][_index].amount;
        require(availableAmount >= _amount, "Selected amount not available!");

        uint price = _amount * sales[address(nft1155)][_index].price;
        uint comission = _calcComission(price);

        erc20.transferFrom(_msgSender(), owner(), comission);
        erc20.transferFrom(_msgSender(), sales[address(nft1155)][_index].owner, price - comission);
        nft1155.safeTransferFrom(address(this), _msgSender(), sales[address(nft1155)][_index].itemId, _amount, "");

        if (availableAmount == _amount) delete sales[address(nft1155)][_index];
        else sales[address(nft1155)][_index].amount = availableAmount - _amount;
    }

    function cancel(uint _index, uint _amount) external override {
        require(sales[address(nft1155)][_index].owner == _msgSender(), "You are not an owner!");
        require(_amount > 0, "Amount cant be null");
        uint availableAmount = sales[address(nft1155)][_index].amount;
        require(availableAmount >= _amount, "Selected amount not available!");

        nft1155.safeTransferFrom(address(this), _msgSender(), sales[address(nft1155)][_index].itemId, _amount, "");

        if (availableAmount == _amount) delete sales[address(nft1155)][_index];
        else sales[address(nft1155)][_index].amount = availableAmount - _amount;
    }

    function listItemOnAuction(uint _itemId, uint _amount, uint _startPrice) external override {
        require(_startPrice > 0, "Start price cant be null");
        require(_amount > 0, "Amount cant be null");

        nft1155.safeTransferFrom(_msgSender(), address(this), _itemId, _amount, "");

        uint index = curretnIndex1155;
        curretnIndex1155++;

        auctions[address(nft1155)][index].info.owner = _msgSender();
        auctions[address(nft1155)][index].info.price = _startPrice;
        auctions[address(nft1155)][index].info.amount = _amount;
        auctions[address(nft1155)][index].info.itemId = _itemId;
        auctions[address(nft1155)][index].finishTime = auctionDuration + block.timestamp;
    }

    function makeBid(address _contract, uint _index, uint _value) external override {
        require(auctions[address(nft1155)][_index].finishTime > block.timestamp, "Cant find activity auction!");
        require(auctions[address(nft1155)][_index].info.owner != _msgSender(), "Owner cant bid!");
        require(auctions[address(nft1155)][_index].info.price < _value, "Value below the minimum price!");
        require(auctions[address(nft1155)][_index].lastBidder != _msgSender(), "Cant bid twice in a row!");

        erc20.transferFrom(_msgSender(), address(this), _value);
        if (auctions[address(nft1155)][_index].bids > 0)
            erc20.transfer(auctions[address(nft1155)][_index].lastBidder, auctions[address(nft1155)][_index].info.price);

        auctions[address(nft1155)][_index].info.price = _value;
        auctions[address(nft1155)][_index].lastBidder = _msgSender();
        auctions[address(nft1155)][_index].bids++;   
    }

    function finishAuction(address _contract, uint _index) external override {
        require(auctions[address(nft1155)][_index].info.price > 0, "Cant find auction!");
        require(auctions[address(nft1155)][_index].finishTime < block.timestamp, "Cant finish yet!");

        Auction memory _auction = auctions[address(nft1155)][_index];
        delete auctions[address(nft1155)][_index];
        uint bids = _auction.bids;
        address _owner = _auction.info.owner;
        
        if (bids > 0) {
            address lastBidder = _auction.lastBidder;
            uint price = _auction.info.price;

            if (bids > 2) {
                uint comission = _calcComission(price);
                erc20.transfer(owner(), comission);
                erc20.transfer(_owner, price - comission);
                nft1155.safeTransferFrom(address(this), lastBidder, _auction.info.itemId, _auction.info.amount, "");
                return;
            } 
            erc20.transfer(lastBidder, price);
        }
        nft1155.safeTransferFrom(address(this), _owner, _auction.info.itemId, _auction.info.amount, "");
    }
}   