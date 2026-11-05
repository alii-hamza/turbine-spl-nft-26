import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import wallet from "../../devnet-wallet.json";
import {
  createSignerFromKeypair,
  generateSigner,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { create, fetchAsset, mplCore, update } from "@metaplex-foundation/mpl-core";
import { base58 } from "@metaplex-foundation/umi/serializers";

const umi = createUmi(
  process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
);

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));
umi.use(mplCore());

(async () => {
  try {
    const metadataUri =
      process.env.NFT_METADATA_URI ??
      "https://gateway.irys.xyz/BihKZnhMCvxN3i34cv25eEyFgUvBVGJQn1Gp11D4LxEi";

    const asset = generateSigner(umi);
    const tx = create(umi, {
      asset,
      name: "Turbine Core NFT",
      uri: metadataUri,
      owner: signer.publicKey,
    });

    const result = await tx.sendAndConfirm(umi);
    const signature = base58.deserialize(result.signature)[0];

    console.log(`Mint signature: ${signature}, asset: ${asset.publicKey}`);

    const updatedAsset = await fetchAsset(umi, asset.publicKey);
    const updateTx = update(umi, {
      asset: updatedAsset,
      name: "Turbine Core NFT Updated",
      uri: metadataUri,
      authority: signer,
    });

    const updateResult = await updateTx.sendAndConfirm(umi);
    const updatedSignature = base58.deserialize(updateResult.signature)[0];

    console.log(`Update signature: ${updatedSignature}`);
  } catch (error) {
    console.log("error", error);
  }
})();
