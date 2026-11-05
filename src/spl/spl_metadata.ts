import {
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import wallet from "../../devnet-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createMetadataAccountV3,
  CreateMetadataAccountV3InstructionAccounts,
  DataV2Args,
} from "@metaplex-foundation/mpl-token-metadata";
import bs58 from "bs58";

// Replace with the mint address returned by spl_init.ts.
const mint = publicKey("5XQnHZm1w8M1K2pH9v9vX3DzP2WZ3J47kQnYv5kH8M8J");

const umi = createUmi(process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com");

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));

(async () => {
  try {
    const accounts: CreateMetadataAccountV3InstructionAccounts = {
      mint,
      mintAuthority: signer,
      updateAuthority: signer,
    };

    const data: DataV2Args = {
      name: "Turbine Token",
      symbol: "TURBINE",
      uri: "https://example.com/turbine-token.json",
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null,
    };

    const tx = createMetadataAccountV3(umi, {
      ...accounts,
      data,
      isMutable: true,
      collectionDetails: null,
    });

    const result = await tx.sendAndConfirm(umi);
    console.log("signature:", bs58.encode(Buffer.from(result.signature)));
  } catch (error) {
    console.log("error", error);
  }
})();
