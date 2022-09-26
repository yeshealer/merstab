import {
  attestFromEth,
  attestFromSolana,
  CHAIN_ID_ETH,
  CHAIN_ID_SOLANA,
  createWrappedOnEth,
  createWrappedOnSolana,
  getEmitterAddressEth,
  getEmitterAddressSolana,
  getSignedVAA,
  getSignedVAAWithRetry,
  parseSequenceFromLogEth,
  parseSequenceFromLogSolana,
  postVaaSolana,
} from '@certusone/wormhole-sdk'
import { Connection } from '@solana/web3.js'
import { Signer } from 'ethers'
import { WalletContextState } from '@solana/wallet-adapter-react'
import {
  ETH_BRIDGE_ADDRESS,
  ETH_TOKEN_BRIDGE_ADDRESS,
  SOL_BRIDGE_ADDRESS,
  SOL_TOKEN_BRIDGE_ADDRESS,
  WORMHOLE_RPC_HOST,
} from './constants'

export const attestFromSolanaToEthereum = async (
  connection: Connection,
  payerAddress: string,
  mintAddress: string,
  solana: WalletContextState,
  signer: Signer
) => {
  // Submit transaction - results in a Wormhole message being published
  const transaction = await attestFromSolana(
    connection,
    SOL_BRIDGE_ADDRESS,
    SOL_TOKEN_BRIDGE_ADDRESS,
    payerAddress,
    mintAddress
  )

  if (!solana.signTransaction) return

  const signed = await solana.signTransaction(transaction)
  const txid = await connection.sendRawTransaction(signed.serialize())
  await connection.confirmTransaction(txid)
  // Get the sequence number and emitter address required to fetch the signedVAA of our message
  const info = await connection.getTransaction(txid)
  if (!info) return
  const sequence = parseSequenceFromLogSolana(info)
  const emitterAddress = await getEmitterAddressSolana(SOL_TOKEN_BRIDGE_ADDRESS)
  // Fetch the signedVAA from the Wormhole Network (this may require retries while you wait for confirmation)
  const signedVAA = await getSignedVAA(
    WORMHOLE_RPC_HOST,
    CHAIN_ID_SOLANA,
    emitterAddress,
    sequence
  )

  // Create the wrapped token on Ethereum
  await createWrappedOnEth(ETH_TOKEN_BRIDGE_ADDRESS, signer, signedVAA.vaaBytes)
}

export const attestFromEthereumToSolana = async (
  connection: Connection,
  signer: Signer,
  tokenAddress: string,
  solana: WalletContextState
) => {
  // Submit transaction - results in a Wormhole message being published
  const receipt = await attestFromEth(
    ETH_TOKEN_BRIDGE_ADDRESS,
    signer,
    tokenAddress
  )
  console.log(`receipt: ${receipt}`)
  // Get the sequence number and emitter address required to fetch the signedVAA of our message
  const sequence = parseSequenceFromLogEth(receipt, ETH_BRIDGE_ADDRESS)
  console.log(`sequence: ${sequence}`)
  const emitterAddress = getEmitterAddressEth(ETH_TOKEN_BRIDGE_ADDRESS)
  console.log(`emitterAddress: ${emitterAddress}`)
  // Fetch the signedVAA from the Wormhole Network (this may require retries while you wait for confirmation)
  // this confirmation can take awhile, we should prompt the user again before we create a solana transaction
  // so the blockhash doesnt expire
  const { vaaBytes: signedVAA } = await getSignedVAAWithRetry(
    [WORMHOLE_RPC_HOST],
    CHAIN_ID_ETH,
    emitterAddress,
    sequence
  )

  if (!solana.signTransaction || !solana.publicKey) return

  // On Solana, we have to post the signedVAA ourselves
  await postVaaSolana(
    connection,
    solana.signTransaction,
    SOL_BRIDGE_ADDRESS,
    solana.publicKey?.toString(), // payer address
    Buffer.from(signedVAA)
  )
  // Finally, create the wrapped token
  const transaction = await createWrappedOnSolana(
    connection,
    SOL_BRIDGE_ADDRESS,
    SOL_TOKEN_BRIDGE_ADDRESS,
    solana.publicKey?.toString(),
    signedVAA
  )
  const signed = await solana.signTransaction(transaction)
  const txid = await connection.sendRawTransaction(signed.serialize())
  console.log(txid)
  await connection.confirmTransaction(txid)
}
