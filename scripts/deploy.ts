import { run, ethers } from "hardhat";
import { MarketPlace721__factory } from "../typechain";
import { ERCTOKEN__factory } from "../typechain";
import { NFT1155__factory, NFT721__factory } from "../typechain";
import { MarketPlace1155__factory } from "../typechain/factories/MarketPlace1155__factory";
import { MarketPlaceMain__factory } from "../typechain/factories/MarketPlaceMain__factory";

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

async function deploy() {
  const [signer] = await ethers.getSigners();

  const erc20 = await new ERCTOKEN__factory(signer).deploy("20 Token", "20S");
  await erc20.deployed();
  console.log("ERC20 Contract deployed to:", erc20.address);

  const erc1155 = await new NFT1155__factory(signer).deploy("1155 NFTS", "1155S");
  await erc1155.deployed();
  console.log("ERC1155 Contract deployed to:", erc1155.address);

  const erc721 = await new NFT721__factory(signer).deploy("721 NFTS", "721S");
  await erc721.deployed();
  console.log("ERC721 Contract deployed to:", erc721.address);

  const mp721 = await new MarketPlace721__factory(signer).deploy();
  await mp721.deployed();
  console.log("MarketPlace721 Contract deployed to:", mp721.address);

  const mp1155 = await new MarketPlace1155__factory(signer).deploy();
  await mp1155.deployed();
  console.log("MarketPlace1155 Contract deployed to:", mp1155.address);

  const marketplace = await new MarketPlaceMain__factory(signer).deploy(erc20.address, erc721.address, erc1155.address, mp721.address, mp1155.address, 60*24*3);
  await marketplace.deployed();
  console.log("MarketPlaceMain Contract deployed to:", marketplace.address);

  
  await erc1155.changeRightsToMint(marketplace.address);
  await erc721.changeRightsToMint(marketplace.address);
  await erc20.mint(signer.address, ethers.utils.parseEther("10"));


  // verify
  await run("verify:verify", {
    address: erc20.address,
    constructorArguments: ["20 Token", "20S"],
  });

  await run("verify:verify", {
    address: erc1155.address,
    constructorArguments: ["1155 NFTS", "1155S"],
  });

  await run("verify:verify", {
    address: erc721.address,
    constructorArguments: ["721 NFTS", "721S"],
  });

  await run("verify:verify", {
    address: mp721.address,
    constructorArguments: [],
  });

  await run("verify:verify", {
    address: mp1155.address,
    constructorArguments: [],
  });

  await run("verify:verify", {
    address: marketplace.address,
    constructorArguments: [erc20.address, erc721.address, erc1155.address, mp721.address, mp1155.address, 60*24*3],
  });

  // marketplace = await ethers.getContractAt("MarketPlaceMain", "0x85FA53Be75191C28b1e0BeFb76DD634260cb9617", signer);

  let _selectors: string[] = [];
  
  for (let i = 0; i < selectors721.length; i++)
    _selectors.push(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(selectors721[i])).slice(0, 10));
  await marketplace.setSelectors(_selectors, mp721.address);

  _selectors = [];

  for (let i = 0; i < selectors1155.length; i++)
    _selectors.push(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(selectors1155[i])).slice(0, 10));
  await marketplace.setSelectors(_selectors, mp1155.address);
}

deploy().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
