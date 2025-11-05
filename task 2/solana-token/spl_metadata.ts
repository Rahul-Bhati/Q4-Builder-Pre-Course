import wallet from "./guideSecret.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { 
    createMetadataAccountV3, 
    CreateMetadataAccountV3InstructionAccounts, 
    CreateMetadataAccountV3InstructionArgs,
    DataV2Args,
    MPL_TOKEN_METADATA_PROGRAM_ID
} from "@metaplex-foundation/mpl-token-metadata";
import { createSignerFromKeypair, signerIdentity, publicKey } from "@metaplex-foundation/umi";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

// Define our Mint address
const mint = new PublicKey("J3M44rYYuJTV49jcKS5tEVoipv1azDZt8Feaap6GzjyL")
const mint_umi = publicKey("J3M44rYYuJTV49jcKS5tEVoipv1azDZt8Feaap6GzjyL")

// Create a UMI connection
const umi = createUmi('https://api.devnet.solana.com');
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(createSignerFromKeypair(umi, keypair)));


(async () => {
    try {
        const pda = PublicKey.findProgramAddressSync([Buffer.from("metadata"), mint.toBuffer()], TOKEN_PROGRAM_ID);
        // Start here
        let accounts: CreateMetadataAccountV3InstructionAccounts ={ mint: mint_umi, mintAuthority: signer }

        // define metadta
        let data: DataV2Args = {
            name: "Q4 Pre Builder",
            symbol: "Q4PB",
            uri: "https://copper-delicate-viper-215.mypinata.cloud/ipfs/bafkreifuqvq4gahap7wijsdawyxg4h6jype6j77d7pxx6kf5tgzi3djm3e",
            sellerFeeBasisPoints: 500, // 5% fee
            creators: null,
            collection: null,
            uses: null
        }

        let args: CreateMetadataAccountV3InstructionArgs = { data, isMutable: false, collectionDetails: null }

        let tx = createMetadataAccountV3(
            umi,
            {
                ...accounts,
                ...args
            }
        )

        let result = await tx.sendAndConfirm(umi);
        console.log("Transaction Signature: ", bs58.encode(result.signature));
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();
