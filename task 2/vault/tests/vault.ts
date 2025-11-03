import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Vault } from "../target/types/vault";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

describe("vault", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Vault as Program<Vault>;
  const user_keypair = anchor.web3.Keypair.generate();
  const connection = provider.connection;
  connection.requestAirdrop(user_keypair.publicKey, LAMPORTS_PER_SOL * 5);

  // vault and vault_state are the pds of the vault program
  // vault_state is the state of the vault program that store the bump of the vault and vault_state
  // vault is the vault account that store the fund
  // user is the user account that is used to sign the transaction
  // systemProgram is the system program that is used to transfer the fund
   
  // how to derive the vault and vault_state pds
  const [vault_pda, vault_bump] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vault"), user_keypair.publicKey.toBuffer()], program.programId);
  const [vault_state_pda, vault_state_bump] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("state"), user_keypair.publicKey.toBuffer()], program.programId);

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().accounts({
      user: user_keypair.publicKey,
      vaultState: vault_state_pda,
      vault: vault_pda,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([user_keypair])
    .rpc();
    console.log("Your transaction signature", tx);
  });
});
