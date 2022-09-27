import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import * as anchor from '@project-serum/anchor'
import { MerstabClient } from '../../merstab'

export async function initialize(env: string, wallet: Keypair) {
  const connection =
    env === 'devnet'
      ? new Connection('https://api.devnet.solana.com')
      : new Connection('http://localhost:8899')
  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(wallet),
    { skipPreflight: false }
  )
  const merstab = await MerstabClient.connect(provider, env)
  return merstab
}
