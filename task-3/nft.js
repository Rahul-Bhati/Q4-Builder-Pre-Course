import { generateSigner, percentAmount, createSignerFromKeypair, signerIdentity } from '@metaplex-foundation/umi'
import { createNft } from '@metaplex-foundation/mpl-token-metadata'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
// Import necessary helper to load a Keypair from a file
import { fromWeb3JsKeypair } from '@metaplex-foundation/umi-web3js-adapters'

// Import Solana web3.js for Keypair loading (often used to read from id.json)
import * as web3 from '@solana/web3.js';
import * as fs from 'fs';

const RPC_ENDPOINT = "https://api.devnet.solana.com";
const umi = createUmi(RPC_ENDPOINT);

// --- 🔑 New Code to Load Signer Identity ---
// 1. Load your Keypair (e.g., from your local Solana config file)
// const payerSecretKey = JSON.parse(fs.readFileSync(wallet).toString()); // **<-- UPDATE PATH HERE**
const payerKeypair = web3.Keypair.fromSecretKey(new Uint8Array([121,128,84,243,194,183,8,240,24,8,241,230,133,12,12,58,240,52,231,216,93,248,77,130,166,82,83,230,176,225,129,233,244,223,207,228,251,137,104,60,147,190,62,159,115,156,234,124,9,12,32,144,105,128,243,251,109,33,251,102,13,89,38,132]));

// 2. Convert the web3.js Keypair to a Umi Signer
const payerSigner = createSignerFromKeypair(umi, fromWeb3JsKeypair(payerKeypair));

// 3. Set the Signer as the identity for the Umi instance
// All transactions sent via this 'umi' instance will now be signed by 'payerSigner'
umi.use(signerIdentity(payerSigner));
// ------------------------------------------

const mint = generateSigner(umi);

(async () => {
    // Check the payer's address (optional, for verification)
    console.log(`Payer Address: ${payerSigner.publicKey.toString()}`);

    const result = await createNft(umi, {
        mint: mint,
        name: 'LLyod Frontera',
        uri: 'https://copper-delicate-viper-215.mypinata.cloud/ipfs/bafkreih5jyuqnzpiomhkn3kbrdatjdharqjuzvfqndy5ozf2l7hng2e4hm',
        sellerFeeBasisPoints: percentAmount(5.5),
        // optional if you directly want to add to a collection. Need to verify later.
        // collection: some({ key: collectionMint.publicKey, verified: false }),
      }).sendAndConfirm(umi)

    console.log(`Successfully created NFT! Mint Address: ${mint.publicKey.toString()}`);
    console.log(`Transaction Signature: ${result.signature.toString()}`);

})();