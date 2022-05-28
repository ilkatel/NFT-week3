import * as dotenv from "dotenv";

import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ERCTOKEN__factory, NFT1155__factory, NFT721__factory, MarketPlace721__factory, MarketPlace1155__factory } from "../typechain";
import { MarketPlaceMain__factory } from "../typechain/factories/MarketPlaceMain__factory";

dotenv.config();

let signer: SignerWithAddress;
let acc1: SignerWithAddress;
let acc2: SignerWithAddress;
let erc20: Contract;
let erc721: Contract;
let erc1155: Contract;
let mp721: Contract;
let mp1155: Contract;
let marketplace: Contract;
let proxy721: Contract;
let proxy1155: Contract;

const zeroAddress = ethers.constants.AddressZero;

let selectors721 = [
  "createItem(string)",
  "listItem(uint256,uint256)",
  "buyItem(uint256)",
  "cancel(uint256)",
  "listItemOnAuction(uint256,uint256)"
];
let selectors1155 = [
  "createItem(uint256,string)",
  "listItem(uint256,uint256,uint256)",
  "buyItem(uint256,uint256)",
  "cancel(uint256,uint256)",
  "listItemOnAuction(uint256,uint256,uint256)"
];

async function sleep(duration: number) {
  await ethers.provider.send("evm_increaseTime", [duration]);
  await ethers.provider.send("evm_mine", []);
}

describe("ERC721", function () {
  beforeEach(async function () {
    [signer, acc1] = await ethers.getSigners();
    erc721 = await new NFT721__factory(signer).deploy("Banana NFTS", "BNFT");
    await erc721.deployed();
  });

  it("Testing mint modifier", async function () {
    await expect(erc721.connect(acc1).mint(acc1.address, "uri")).to.be.revertedWith("Have no rights to mint!");
  });

  it("Mint test", async function () {
    await erc721.changeRightsToMint(acc1.address);
    await expect(() => erc721.connect(acc1).mint(acc1.address, "uri")).changeTokenBalance(erc721, acc1, 1);
  });
});

describe("ERC1155", function () {
  beforeEach(async function () {
    [signer, acc1] = await ethers.getSigners();
    erc1155 = await new NFT1155__factory(signer).deploy("Coconut NFTS", "CNFT");
    await erc1155.deployed();
  });

  it("Testing mint modifier", async function () {
    await expect(erc1155.connect(acc1).mint(acc1.address, 10, "uri")).to.be.revertedWith("Have no rights to mint!");
  });

  it("Mint test", async function () {
    await erc1155.changeRightsToMint(acc1.address);
    await erc1155.connect(acc1).mint(acc1.address, 10, "uri");
    await expect(erc1155.connect(acc1).mint(acc1.address, 0, "uri"))
      .to.be.revertedWith("Cant mint the null tokens!");
    expect(await erc1155.balanceOf(acc1.address, 0)).to.be.eq(10);
    expect(await erc1155.totalSupply(0)).to.be.eq(10);
  });
});

describe("MarketPlace", function () {
  beforeEach(async function () {
    [signer, acc1, acc2] = await ethers.getSigners();

    erc20 = await new ERCTOKEN__factory(signer).deploy("MarketPlace Token", "MPT");
    await erc20.deployed();

    erc721 = await new NFT721__factory(signer).deploy("Banana NFTS", "BNFT");
    await erc721.deployed();

    erc1155 = await new NFT1155__factory(signer).deploy("Coconut NFTS", "CNFT");
    await erc1155.deployed();

    mp721 = await new MarketPlace721__factory(signer).deploy();
    await mp721.deployed();

    mp1155 = await new MarketPlace1155__factory(signer).deploy();
    await mp1155.deployed();

    marketplace = await new MarketPlaceMain__factory(signer).deploy(erc20.address, erc721.address, erc1155.address, mp721.address, mp1155.address, 100);
    await marketplace.deployed();
    proxy721 = mp721.attach(marketplace.address);
    proxy1155 = mp1155.attach(marketplace.address);

    let _selectors: string[] = [];
    for (let i = 0; i < selectors721.length; i++)
      _selectors.push(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(selectors721[i])).slice(0, 10));
    await marketplace.setSelectors(_selectors, mp721.address);
    _selectors = [];
    for (let i = 0; i < selectors1155.length; i++)
      _selectors.push(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(selectors1155[i])).slice(0, 10));
    await marketplace.setSelectors(_selectors, mp1155.address);

    await erc1155.changeRightsToMint(marketplace.address);
    await erc721.changeRightsToMint(marketplace.address);

    await erc20.mint(acc1.address, ethers.utils.parseEther("10"));
    await erc20.mint(acc2.address, ethers.utils.parseEther("10"));
    await erc20.mint(signer.address, ethers.utils.parseEther("10"));

    await erc20.connect(acc1).approve(marketplace.address, ethers.utils.parseEther("10"));
    await erc20.connect(acc2).approve(marketplace.address, ethers.utils.parseEther("10"));
    await erc20.approve(marketplace.address, ethers.utils.parseEther("10"));
  });

  it("MarketPlace: require test", async function () {
    await expect(marketplace.setSelectors(["0x12345678"], zeroAddress)).to.be.revertedWith("Cant set zero address!");
  });

  it("ERC721: Create item", async function () {
    expect(await erc721.balanceOf(signer.address)).to.be.eq(0);
    await expect(() =>  proxy721.createItem("uri")).changeTokenBalance(erc721, signer, 1);
  });
  
  it("ERC721: List item", async function () {
    await expect(proxy721.listItem(0, 0)).to.be.revertedWith("Price cant be null");
    await expect(proxy721.listItem(0, 1)).to.be.reverted;
    await expect(() => proxy721.createItem("uri")).changeTokenBalance(erc721, signer, 1);
    await erc721.approve(proxy721.address, 0);
    await expect(() => proxy721.listItem(0, 1)).changeTokenBalances(erc721, [signer, marketplace], [-1, 1]);
  });
  
  it("ERC721: Buy item", async function () {
    await expect(proxy721.buyItem(0)).to.be.revertedWith("Item not found!");
    await expect(() => proxy721.connect(acc1).createItem("uri")).changeTokenBalance(erc721, acc1, 1);
    await erc721.connect(acc1).approve(marketplace.address, 0);
    await expect(() => proxy721.connect(acc1).listItem(0, 100)).changeTokenBalances(erc721, [acc1, marketplace], [-1, 1]);
    await erc20.connect(acc2).approve(marketplace.address, 100);
    await expect(() => proxy721.connect(acc2).buyItem(0)).changeTokenBalances(erc20, [signer, acc1], [3, 97, -100]);
    expect(await erc721.balanceOf(acc2.address)).to.be.eq(1);
  });
  
  it("ERC721: Calcel item", async function () {
    await expect(() => proxy721.createItem("uri")).changeTokenBalance(erc721, signer, 1);
    await erc721.approve(marketplace.address, 0);
    await expect(() => proxy721.listItem(0, 100)).changeTokenBalances(erc721, [signer, marketplace], [-1, 1]);
    await expect(proxy721.connect(acc1).cancel(0)).to.be.revertedWith("You are not an owner!");
    await expect(() => proxy721.cancel(0)).changeTokenBalances(erc721, [signer, marketplace], [1, -1]);
  });
  
  it("ERC721: Auction", async function () {
    // list item on auction
    await expect(() => proxy721.connect(acc1).createItem("uri")).changeTokenBalance(erc721, acc1, 1);
    await erc721.connect(acc1).approve(marketplace.address, 0);
    await expect(proxy721.connect(acc1).listItemOnAuction(0, 0)).to.be.revertedWith("Start price cant be null");
    await expect(() => proxy721.connect(acc1).listItemOnAuction(0, 100)).changeTokenBalances(erc721, [marketplace, acc1], [1, -1]);

    // make bid
    await expect(proxy721.connect(acc2).makeBid(mp1155.address,0,100)).to.be.revertedWith("Cant find activity auction!");
    await expect(proxy721.connect(acc1).makeBid(mp721.address,0,1000)).to.be.revertedWith("Owner cant bid!");
    await expect(proxy721.connect(acc2).makeBid(mp721.address,0,99)).to.be.revertedWith("Value below the minimum price!");
    await expect(() => proxy721.connect(acc2).makeBid(mp721.address,0,200)).changeTokenBalances(erc20, [marketplace, acc2], [200, -200]);
    await expect(proxy721.connect(acc2).makeBid(mp721.address,0,300)).to.be.revertedWith("Cant bid twice in a row!");
    await expect(() => proxy721.makeBid(mp721.address,0,300)).changeTokenBalances(erc20, [marketplace, signer, acc2], [(300 - 200), -300, 200]);
    
    // finish auction
    await expect(proxy721.finishAuction(mp721.address, 10)).to.be.revertedWith("Cant find auction!");
    await expect(proxy721.finishAuction(mp721.address, 0)).to.be.revertedWith("Cant finish yet!");
    await sleep(100);
    // bids < 2
    await expect(() => proxy721.finishAuction(mp721.address, 0)).changeTokenBalances(erc20, [marketplace, signer], [-300, 300]);
    expect(await erc721.balanceOf(acc1.address)).to.be.eq(1);
    // bids = 0
    await erc721.connect(acc1).approve(marketplace.address, 0);
    await expect(() => proxy721.connect(acc1).listItemOnAuction(0, 100)).changeTokenBalances(erc721, [marketplace, acc1], [1, -1]);
    await sleep(100);
    await expect(() => proxy721.finishAuction(mp721.address, 0)).changeTokenBalances(erc721, [marketplace, acc1], [-1, 1]);
    // bids > 2
    await erc721.connect(acc1).approve(marketplace.address, 0);
    await expect(() => proxy721.connect(acc1).listItemOnAuction(0, 100)).changeTokenBalances(erc721, [marketplace, acc1], [1, -1]);
    await expect(() => proxy721.connect(acc2).makeBid(mp721.address,0,200)).changeTokenBalances(erc20, [marketplace, acc2], [200, -200]);
    await expect(() => proxy721.makeBid(mp721.address,0,300)).changeTokenBalances(erc20, [marketplace, signer, acc2], [(300 - 200), -300, 200]);
    await expect(() => proxy721.connect(acc2).makeBid(mp721.address,0,1000)).changeTokenBalances(erc20, [marketplace, acc2, signer], [(1000 - 300), -1000, 300]);
    await sleep(100);
    await expect(() => proxy721.finishAuction(mp721.address, 0)).changeTokenBalances(erc20, [marketplace, signer, acc1], [-1000, 30, 970]);
    expect(await erc721.balanceOf(acc2.address)).to.be.eq(1);
  });

  it("ERC1155: Create item", async function () {
    expect(await erc1155.balanceOf(signer.address, 0)).to.be.eq(0);
    await proxy1155.createItem(10, "uri");
    expect(await erc1155.balanceOf(signer.address, 0)).to.be.eq(10);
  });

  it("ERC1155: List item", async function () {
    await expect(proxy1155.listItem(0, 0, 0)).to.be.revertedWith("Price cant be null");
    await expect(proxy1155.listItem(0, 0, 1)).to.be.revertedWith("Amount cant be null");
    await expect(proxy1155.listItem(0, 1, 1)).to.be.reverted;
    await proxy1155.createItem(10, "uri");
    await erc1155.setApprovalForAll(marketplace.address, true);
    await proxy1155.listItem(0, 5, 100);
    expect(await erc1155.balanceOf(signer.address, 0)).to.be.eq(5);
    expect(await erc1155.balanceOf(marketplace.address, 0)).to.be.eq(5);
  });
 
  it("ERC1155: Buy item", async function () {
    await expect(proxy1155.buyItem(1, 1)).to.be.revertedWith("Item not found!");
    await proxy1155.connect(acc1).createItem(10, "uri");
    await erc1155.connect(acc1).setApprovalForAll(marketplace.address, true);
    await proxy1155.connect(acc1).listItem(0, 10, 100);
    await expect(proxy1155.buyItem(0, 0)).to.be.revertedWith("Cant buy zero items!");
    await expect(proxy1155.buyItem(0, 20)).to.be.revertedWith("Selected amount not available!");
    await expect(() => proxy1155.connect(acc2).buyItem(0, 5)).changeTokenBalances(erc20, [acc1, acc2, signer], [485, -500, 15]);
    expect(await erc1155.balanceOf(marketplace.address, 0)).to.be.eq(5);
    expect(await erc1155.balanceOf(acc2.address, 0)).to.be.eq(5);
    await expect(() => proxy1155.connect(acc2).buyItem(0, 5)).changeTokenBalances(erc20, [acc1, acc2, signer], [485, -500, 15]);
    await expect(proxy1155.connect(acc2).buyItem(0, 5)).to.be.revertedWith("Item not found!");
  });
  
  it("ERC1155: Calcel item", async function () {
    await proxy1155.connect(acc1).createItem(10, "uri");
    await erc1155.connect(acc1).setApprovalForAll(marketplace.address, true);
    await proxy1155.connect(acc1).listItem(0, 10, 100);
    await expect(proxy1155.cancel(0, 1)).to.be.revertedWith("You are not an owner!");
    await expect(proxy1155.connect(acc1).cancel(0, 0)).to.be.revertedWith("Amount cant be null");
    await expect(proxy1155.connect(acc1).cancel(0, 20)).to.be.revertedWith("Selected amount not available!");
    await proxy1155.connect(acc1).cancel(0, 7);
    await proxy1155.connect(acc1).cancel(0, 3);
    await expect(proxy1155.connect(acc1).cancel(0, 7)).to.be.reverted;
    expect(await erc1155.balanceOf(acc1.address, 0)).to.be.eq(10);
    expect(await erc1155.balanceOf(marketplace.address, 0)).to.be.eq(0);
  });
  
  it("ERC1155: Auction", async function () {
    // list item on auction
    await proxy1155.connect(acc1).createItem(10, "uri");
    await erc1155.connect(acc1).setApprovalForAll(marketplace.address, true);
    await expect(proxy1155.connect(acc1).listItemOnAuction(0, 0, 0)).to.be.revertedWith("Start price cant be null");
    await expect(proxy1155.connect(acc1).listItemOnAuction(0, 0, 100)).to.be.revertedWith("Amount cant be null");
    await expect(proxy1155.connect(acc1).listItemOnAuction(0, 20, 100)).to.be.reverted;
    await proxy1155.connect(acc1).listItemOnAuction(0, 10, 100);
    expect(await erc1155.balanceOf(acc1.address, 0)).to.be.eq(0);
    expect(await erc1155.balanceOf(marketplace.address, 0)).to.be.eq(10);
   
    // make bid
    await expect(proxy1155.connect(acc2).makeBid(mp721.address,0,100)).to.be.revertedWith("Cant find activity auction!");
    await expect(proxy1155.connect(acc1).makeBid(mp1155.address, 0, 1000)).to.be.revertedWith("Owner cant bid!");
    await expect(proxy1155.connect(acc2).makeBid(mp1155.address, 0, 99)).to.be.revertedWith("Value below the minimum price!");
    await expect(() => proxy1155.makeBid(mp1155.address, 0, 200)).changeTokenBalances(erc20, [marketplace, signer], [200, -200]);
    await expect(proxy1155.makeBid(mp1155.address, 0, 300)).to.be.revertedWith("Cant bid twice in a row!");
    await expect(() => proxy1155.connect(acc2).makeBid(mp1155.address, 0, 300)).changeTokenBalances(erc20, [marketplace, signer, acc2], [(300 - 200), 200, -300]);

    // finish auction
    await expect(proxy1155.finishAuction(mp1155.address, 10)).to.be.revertedWith("Cant find auction!");
    await expect(proxy1155.finishAuction(mp1155.address, 0)).to.be.revertedWith("Cant finish yet!");
    await sleep(100);
    // bids < 2
    await expect(() => proxy1155.finishAuction(mp1155.address, 0)).changeTokenBalances(erc20, [marketplace, acc2], [-300, 300]);
    expect(await erc1155.balanceOf(acc1.address, 0)).to.be.eq(10);
    // bids = 0
    await proxy1155.connect(acc1).listItemOnAuction(0, 10, 100);
    await sleep(100);
    await proxy1155.finishAuction(mp1155.address, 1);
    expect(await erc1155.balanceOf(acc1.address, 0)).to.be.eq(10);
    // bids > 2
    await erc1155.connect(acc1).setApprovalForAll(marketplace.address, true);
    await proxy1155.connect(acc1).listItemOnAuction(0, 10, 100);
    await expect(() => proxy1155.connect(acc2).makeBid(mp1155.address, 2, 200)).changeTokenBalances(erc20, [marketplace, acc2], [200, -200]);
    await expect(() => proxy1155.makeBid(mp1155.address, 2, 300)).changeTokenBalances(erc20, [marketplace, signer, acc2], [(300 - 200), -300, 200]);
    await expect(() => proxy1155.connect(acc2).makeBid(mp1155.address, 2, 1000)).changeTokenBalances(erc20, [marketplace, acc2, signer], [(1000 - 300), -1000, 300]);
    await sleep(100);
    await expect(() => proxy1155.finishAuction(mp1155.address, 2)).changeTokenBalances(erc20, [marketplace, signer, acc1], [-1000, 30, 970]);
    expect(await erc1155.balanceOf(acc2.address, 0)).to.be.eq(10);
  });
});