import { readFileSync } from "fs";
import { create } from "ipfs-http-client";

const ipfs = create({host: "ipfs.infura.io", port: 5001, protocol: "https"});

class IPFS {
  async add (_path: string) {
      const file = readFileSync(_path);
      const result = await ipfs.add({
          path: _path,
          content: file
      });
      return result.cid.toString();
  }
}

export { IPFS };