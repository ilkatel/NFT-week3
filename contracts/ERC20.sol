//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./interfaces/IERC20Mintable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERCTOKEN is IERC20Mintable, ERC20, Ownable {

    constructor(string memory name_, string memory symbol_) 
    ERC20(name_, symbol_) {}

    function mint(address _account, uint _amount) public override onlyOwner {
        _mint(_account, _amount);
    }

    function burn(address _account, uint _amount) public override onlyOwner {
         _burn(_account, _amount);
    }
}