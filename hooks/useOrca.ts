import { getOrca, Network } from '@orca-so/sdk'
import { Connection } from '@solana/web3.js'

export const useOrca = () => {
  const connection = new Connection(
    'https://api.devnet.solana.com',
    'singleGossip'
  )
  const orca = getOrca(connection, Network.DEVNET)
  return orca
}
