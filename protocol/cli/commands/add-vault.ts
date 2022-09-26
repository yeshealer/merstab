import { Keypair } from '@solana/web3.js'
import { initialize } from './initialize'

export async function addVault(
  env: string,
  wallet: Keypair,
  name: string,
  limit: string,
  depositMint: string
) {
  const merstabClient = await initialize(env, wallet)
  console.log(`Adding to vault...`)
  await merstabClient.addVault(name, wallet, parseInt(limit), depositMint)
}
