import { createNft, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { createGenericFile, createSignerFromKeypair, generateSigner, keypairIdentity, percentAmount, sol } from '@metaplex-foundation/umi';
import { mockStorage } from '@metaplex-foundation/umi-storage-mock';
import * as fs from 'fs';
import secret from './wallet.json';

const RPC_ENDPOINT = "https://api.devnet.solana.com";
const umi = createUmi(RPC_ENDPOINT); 

const creatorWallet = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secret));
const creator = createSignerFromKeypair(umi, creatorWallet);
umi.use(keypairIdentity(creator));
umi.use(mplTokenMetadata());
umi.use(mockStorage());


const nftDetail = {
    name: "LLyod Frontera",
    symbol: "LF",
    description: "Task-3: Lloyd is water, water is good , lloyd is good 😏",
    uri: "https://copper-delicate-viper-215.mypinata.cloud/ipfs/bafkreih5jyuqnzpiomhkn3kbrdatjdharqjuzvfqndy5ozf2l7hng2e4hm",
    royalties: 5.5,
    imgType: 'image/png',
    attributes: [
        { trait_type: 'Speed', value: 'BUILD' },
    ]
};

async function uploadImage(): Promise<string> {
    try {
        const imgDirectory = '.';
        const imgName = 'llyod.jpg'
        const filePath = `${imgDirectory}/${imgName}`;
        const fileBuffer = fs.readFileSync(filePath);
        const image = createGenericFile(
            fileBuffer,
            imgName,
            {
                uniqueName: nftDetail.name,
                contentType: nftDetail.imgType
            }
        );
        const [imgUri] = await umi.uploader.upload([image]);
        console.log('Uploaded image:', imgUri);
        return imgUri;
    } catch (e) {
        throw e;
    }

}

async function uploadMetadata(imageUri: string): Promise<string> {
    try {
        const metadata = {
            name: nftDetail.name,
            description: nftDetail.description,
            image: imageUri,
            attributes: nftDetail.attributes,
            properties: {
                files: [
                    {
                        type: nftDetail.imgType,
                        uri: imageUri,
                    },
                ]
            }
        };
        const metadataUri = await umi.uploader.uploadJson(metadata);
        console.log('Uploaded metadata:', metadataUri);
        return metadataUri;
    } catch (e) {
        throw e;
    }
}

async function mintNft(metadataUri: string) {
    try {
        const mint = generateSigner(umi);
        await createNft(umi, {
            mint,
            name: nftDetail.name,
            symbol: nftDetail.symbol,
            uri: metadataUri,
            sellerFeeBasisPoints: percentAmount(nftDetail.royalties),
            creators: [{ address: creator.publicKey, verified: true, share: 100 }],
        }).sendAndConfirm(umi)
        console.log(`Created NFT: ${mint.publicKey.toString()}`)
    } catch (e) {
        throw e;
    }
}

async function main() {
    const metadataUri = "https://copper-delicate-viper-215.mypinata.cloud/ipfs/bafkreifuqvq4gahap7wijsdawyxg4h6jype6j77d7pxx6kf5tgzi3djm3e";
    //  await uploadMetadata(imageUri);
    await mintNft(metadataUri);

    // const imageUri = await uploadImage();
    // const metadataUri = await uploadMetadata(imageUri);
    // await mintNft(metadataUri);
}

main();
// import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
// import { createSignerFromKeypair, signerIdentity, generateSigner, percentAmount } from "@metaplex-foundation/umi"
// import { createNft, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";

// import wallet from "./wallet.json"
// import base58 from "bs58";

// const RPC_ENDPOINT = "https://api.devnet.solana.com";
// const umi = createUmi(RPC_ENDPOINT);

// let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
// const myKeypairSigner = createSignerFromKeypair(umi, keypair);
// umi.use(signerIdentity(myKeypairSigner));
// umi.use(mplTokenMetadata())

// const mint = generateSigner(umi);
// const metadataUri = 'https://copper-delicate-viper-215.mypinata.cloud/ipfs/bafkreih5jyuqnzpiomhkn3kbrdatjdharqjuzvfqndy5ozf2l7hng2e4hm';

// (async () => {
//     let tx = await createNft(umi, {
//         mint: mint,
//         sellerFeeBasisPoints: percentAmount(5.5),
//         name: 'LLyod Frontera',
//         image: "",
//         uri: metadataUri,
//     });

//     let result = await tx.sendAndConfirm(umi);
//     const signature = base58.encode(result.signature);
    
//     console.log(`Succesfully Minted! Check out your TX here:\n https://explorer.solana.com/tx/${signature}?cluster=devnet`)

//     console.log("Mint Address: ", mint.publicKey);

//     /*
// Succesfully Minted! Check out your TX here:
//  https://explorer.solana.com/tx/2hWAPQaPJVaeEGAUmT19VzxpbWsFiNoqUbUjvK9w7zsL3ZRvHuZZxLdRms5yftafeh6QXc3pu4nxLemgW84LNGL7?cluster=devnet
// Mint Address:  BtRaUbU9DRnPy4uVxMFCiYp3t2s68FKytZ2i9e5cQ1nG

// Succesfully Minted! Check out your TX here:
//  https://explorer.solana.com/tx/toG1Uc1QHmhAD8VVXujtVcgxzQnzvgZh9icY4NTX6EH8iLm6rjHKd9HAWGNA9hTJbyqoaYrGbDYvVMACeBZuj5L?cluster=devnet
// Mint Address:  GGrri8gQvddnEGxvZDYQ9NiXNyyEjF3AsbpCDWgJkYpk
// Done in -105.66s.
//     */
// })();