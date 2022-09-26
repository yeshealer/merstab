import { Keypair, PublicKey } from '@solana/web3.js'
import { initialize } from './initialize'
import * as anchor from '@project-serum/anchor'

export async function stake(
  env: string,
  wallet: Keypair,
  amount: string,
  vault: string,
  depositMint: string
) {
  const merstabClient = await initialize(env, wallet)
  console.log(`Staking to vault...`)
  return await merstabClient.stake(
    new anchor.BN(amount),
    wallet.publicKey,
    new PublicKey(vault),
    new PublicKey(depositMint),
    wallet
  )
}
