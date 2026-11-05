import {
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import wallet from "../../devnet-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";

const umi = createUmi(
  process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
);

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(
  irysUploader({
    address: "https://devnet.irys.xyz/",
  }),
);

umi.use(signerIdentity(signer));

(async () => {
  try {
    const image =
      process.env.NFT_IMAGE_URI ??
      "https://gateway.irys.xyz/5EDyiNrMWfhjdsEwXLrwkHPwZoZB2m1A2Kudrfxo1tpr";

    const metadata = {
      name: "Turbine Core NFT",
      symbol: "TURBINE",
      description: "A sample NFT minted with MPL Core on Solana devnet.",
      image,
      attributes: [{ trait_type: "Collection", value: "Turbine" }],
      properties: {
        files: [{ uri: image, type: "image/png" }],
        category: "image",
      },
    };

    const myUri = await umi.uploader.uploadJson(metadata);
    console.log(`metadata uri: ${myUri}`);
  } catch (error) {
    console.log("error", error);
  }
})();
