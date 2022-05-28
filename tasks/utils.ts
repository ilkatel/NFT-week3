import * as dotenv from "dotenv";

dotenv.config();

class utils {
    
    async proxy721(hre: any) {
        const [signer] = await hre.ethers.getSigners();
        const marketplace = await hre.ethers.getContractAt("MarketPlaceMain", process.env.MARKETPLACE as string, signer);
        const mp721 = await hre.ethers.getContractAt("MarketPlace721", process.env.MP721 as string, signer);
        const proxy = mp721.attach(marketplace.address);
        return proxy;
    }   

    async proxy1155(hre: any) {
        const [signer] = await hre.ethers.getSigners();
        const marketplace = await hre.ethers.getContractAt("MarketPlaceMain", process.env.MARKETPLACE as string, signer);
        const mp1155 = await hre.ethers.getContractAt("MarketPlace1155", process.env.MP1155 as string, signer);
        const proxy = mp1155.attach(marketplace.address);
        return proxy;
    }
}

export { utils }