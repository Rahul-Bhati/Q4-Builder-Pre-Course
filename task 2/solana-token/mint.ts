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
import bs58 from 'bs58';
import { Commitment, Connection, Keypair, PublicKey } from "@solana/web3.js";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from "@solana/spl-token";

// Define our Mint address
// const mint = new PublicKey("GYtN8TPtX9j4um3XVjjXNbrSmu4Ei6zNe7et98p7Dr2H")
// const mint_umi = publicKey("GYtN8TPtX9j4um3XVjjXNbrSmu4Ei6zNe7et98p7Dr2H")

// Create a UMI connection
const umi = createUmi('https://api.devnet.solana.com');
const umiKeypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, umiKeypair);
umi.use(signerIdentity(createSignerFromKeypair(umi, umiKeypair)));

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);
const token_decimals = 1_000_000n;

(async () => {
    try {
        // Start here
        const mint = await createMint(connection, keypair, keypair.publicKey, null, 6);
        console.log("Mint Address ", mint);

        // Create an ATA
        const ata = await getOrCreateAssociatedTokenAccount(connection, keypair, mint, keypair.publicKey);
        console.log(`Your ata is: ${ata.address.toBase58()}`);

        // Mint to ATA
        const mintTx = await mintTo(connection, keypair, mint, ata.address, keypair.publicKey, 1n * token_decimals);
        console.log(`Your mint txid: ${mintTx}`);

        const pda = PublicKey.findProgramAddressSync([Buffer.from("metadata"), mint.toBuffer()], TOKEN_PROGRAM_ID);
        // Start here
        let accounts: CreateMetadataAccountV3InstructionAccounts ={ mint: publicKey(mint), mintAuthority: signer }

        // define metadta
        let data: DataV2Args = {
            name: "Q4 Pre Builder cohart",
            symbol: "Q4",
            uri: "",
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


// import { percentAmount, generateSigner, signerIdentity, createSignerFromKeypair } from '@metaplex-foundation/umi';
// import { TokenStandard, createAndMint, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
// import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';

// // https://solana-devnet.g.alchemy.com/v2/UF9w6_HMnkktbUVaZoPB2fmNYGg7mBs6ort { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
// // @ts-ignore
// // import secret from './guideSecret.json' assert { type: "json" };

// const secret = [9, 75, 241, 142, 63, 162, 17, 121, 152, 61, 165, 24, 44, 87, 38, 216, 98, 47, 68, 244, 203, 140, 226, 251, 204, 18, 11, 46, 5, 101, 196, 40, 35, 29, 0, 220, 117, 132, 181, 84, 72, 115, 162, 50, 38, 127, 105, 218, 114, 165, 219, 172, 146, 224, 217, 224, 87, 157, 56, 111, 72, 56, 215, 190];

// const umi = createUmi('https://solana-devnet.g.alchemy.com/v2/UF9w6_HMnkktbUVaZoPB2fmNYGg7mBs6');

// const userWallet = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secret));
// const userWalletSigner = createSignerFromKeypair(umi, userWallet);

// const metadata = {
//     name: "Q4 Pre Builder",
//     symbol: "QPB",
//     uri: "https://copper-delicate-viper-215.mypinata.cloud/ipfs/bafkreifuqvq4gahap7wijsdawyxg4h6jype6j77d7pxx6kf5tgzi3djm3e"
// };

// const mint = generateSigner(umi);
// umi.use(signerIdentity(userWalletSigner));
// umi.use(mplTokenMetadata())

// createAndMint(umi, {
//     mint,
//     authority: umi.identity,
//     name: metadata.name,
//     symbol: metadata.symbol,
//     uri: metadata.uri,
//     sellerFeeBasisPoints: percentAmount(0),
//     decimals: 8,
//     amount: 1000000_00000000,
//     tokenOwner: userWallet.publicKey,
//     tokenStandard: TokenStandard.Fungible,
// }).sendAndConfirm(umi)
//     .then(() => console.log("Successfully minted 1 million tokens (", mint.publicKey, ")"))
//     .catch((err) => console.error("Error minting tokens:", err));