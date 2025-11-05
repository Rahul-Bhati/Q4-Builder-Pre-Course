import { Commitment, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, Transaction } from "@solana/web3.js"
import wallet from "./guideSecret.json"
import { createTransferInstruction, getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Mint address
const mint = new PublicKey("J3M44rYYuJTV49jcKS5tEVoipv1azDZt8Feaap6GzjyL");

// Recipient address
const to = new PublicKey("Ajkkona22hnTBepa4WwCY9LFTih3nFRJYT8nafHRTbP4");

(async () => {
    try {
        // Get the token account of the fromWallet address, and if it does not exist, create it
        const fromATA = await getOrCreateAssociatedTokenAccount(connection, keypair, mint, keypair.publicKey);

        console.warn("ATA from account : ", fromATA);

        // Get the token account of the toWallet address, and if it does not exist, create it
        const toATA = await getOrCreateAssociatedTokenAccount(connection, keypair, mint, to);

        console.warn("ATA from account : ", toATA);

        // Transfer the new token to the "toTokenAccount" we just created

        // Create instruction to transfer tokens
        const instruction = createTransferInstruction(fromATA.address, toATA.address, keypair.publicKey, 100);

        console.log("Instruction : ", instruction);

        // Create transaction
        const transaction = new Transaction().add(instruction);

        console.log("transaction : ", transaction);

        // Sign and send transaction
        const transactionSignature = await sendAndConfirmTransaction(connection, transaction, [keypair]);

        console.log("\nTransaction Signature:", `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`);
    } catch (e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();