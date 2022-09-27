import { Keypair, PublicKey } from '@solana/web3.js'
import { initialize } from './initialize'
import * as anchor from '@project-serum/anchor'

export async function unstake(
  env: string,
  wallet: Keypair,
  amount: number,
  vault: string,
  depositMint: string
) {
  const merstabClient = await initialize(env, wallet)
  console.log(`Unstaking from vault...`)
  return await merstabClient.unstake(
    new anchor.BN(amount),
    wallet.publicKey,
    new PublicKey(vault),
    new PublicKey(depositMint),
    wallet
  )
}
