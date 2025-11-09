import wallet from "./wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
    try {
        // Follow this JSON structure
        // https://docs.metaplex.com/programs/token-metadata/changelog/v1.0#json-structure

        // const image = ;
        const metadata = {
            name: "LLyod Frontera",
            symbol: "LF",
            description: "Task-3: Lloyd is water, water is good , lloyd is good 😏",
            image: "https://arweave.net/HaFm6g8zuPvJPSfUM4eVqCZ6FbRK7WrKizw3TRFwBcin",
            attributes: [{trait_type: 'BUILD', value: 'BUILD'}],
            properties: {
                files: [
                    {
                        type: "image/png",
                        uri: "https://arweave.net/HaFm6g8zuPvJPSfUM4eVqCZ6FbRK7WrKizw3TRFwBcin"
                    },
                ]
            },
            creators: ["rahul bhati", "Discord: rahulbhati", "agency: https://app4sure.vercel.app/", "portfolio: https://rahul-bhati.github.io/", "github: https://github.com/Rahul-Bhati", "linkedin: https://www.linkedin.com/in/rahul-bhati-25482a1a0/", "resume: https://drive.google.com/file/d/1nLb3W7G4E1Xap0V_Ehjv7_G0p-0Uj-l3/view?usp=sharing "]
        };
        const myUri = await umi.uploader.uploadJson(metadata).catch((err) => {
            throw new Error(err)
        })
        console.log("Your metadata URI: ", myUri); // https://arweave.net/D5z6vnNGpp3HJsuT4D3g8Bo576N5KEGMth8gozZpAUgZ
    }
    catch(error) {
        console.log("Oops.. Something went wrong", error);
    }
})();
