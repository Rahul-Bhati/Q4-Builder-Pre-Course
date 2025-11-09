import wallet from "./wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"
import { readFile } from "fs/promises"
import path from "path"

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader({ address: "https://devnet.irys.xyz/"}));
umi.use(signerIdentity(signer));

(async () => {
    try {
        //1. Load image
        const image = await readFile(path.join(__dirname, './llyod.jpg'));
        console.log("Image", image);

        //2. Convert image to generic file.
        const umiImageFile = await createGenericFile(image, 'llyod.jpg', {
            tags: [{ name: 'Content-Type', value: 'image/png' }],
        })

        console.log("umiImageFile", umiImageFile);
 
        //3. Upload image
        const [myUri] = await umi.uploader.upload([umiImageFile]).catch((err) => {
            throw new Error(err)
        })

        console.log("Your image URI: ", myUri); // https://arweave.net/4EybREBvG9HBXSWwrwja3tzyxEvBTiaBDDD8BCe1tPrW
    }
    catch(error) {
        console.log("Oops.. Something went wrong", error);
    }
})();
