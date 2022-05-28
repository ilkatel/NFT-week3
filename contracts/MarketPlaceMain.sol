// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./BaseMP.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "./interfaces/IMarketPlace721.sol";
import "./interfaces/IMarketPlace1155.sol";

contract MarketPlaceMain is BaseMP, ERC721Holder, ERC1155Holder {

    address public mp721;
    address public mp1155;
    mapping(bytes4 => address) public selectorToAddress;

    constructor(address _erc20, address _erc721, address _erc1155, address _mp721, address _mp1155, uint _auctionDuration) {
        erc20 = IERC20(_erc20);
        nft721 = INFT721(_erc721);
        nft1155 = INFT1155(_erc1155);
        mp721 = _mp721;
        mp1155 = _mp1155;
        auctionDuration = _auctionDuration;
    }

    function setSelectors(bytes4[] memory _selectors, address _contract) external onlyOwner {
        require(_contract != address(0), "Cant set zero address!");
        for (uint i = 0; i < _selectors.length; i++)
            selectorToAddress[_selectors[i]] = _contract;
    }   

    fallback() external {
        address facet = selectorToAddress[msg.sig];
        // for makeBid and FinishAuction
        if (facet == address(0)) {
            address addr;
            address addr721 = mp721;
            address addr1155 = mp1155;
            assembly {
                calldatacopy(0, 0, calldatasize())
                addr := mload(4)
                if eq(addr, addr721) { facet := addr721 }
                if eq(addr, addr1155) { facet := addr1155 }
            }
        }
        require(facet != address(0), "Cant find function!");
        // eip2535
        assembly {
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(gas(), facet, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch result
            case 0 { revert(0, returndatasize()) }
            default { return (0, returndatasize()) }
        }
    }
}   