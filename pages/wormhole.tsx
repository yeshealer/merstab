import {
  approveEth,
  CHAIN_ID_ETH,
  CHAIN_ID_SOLANA,
  getEmitterAddressEth,
  getForeignAssetSolana,
  getIsTransferCompletedSolana,
  getSignedVAAWithRetry,
  hexToUint8Array,
  nativeToHexString,
  parseSequenceFromLogEth,
  postVaaSolana,
  redeemOnSolana,
  transferFromEth,
} from '@certusone/wormhole-sdk'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction } from '@solana/web3.js'
import { Button } from 'antd'
import { parseUnits } from 'ethers/lib/utils'
import React, { useEffect } from 'react'
import {
  ETH_BRIDGE_ADDRESS,
  ETH_TOKEN_BRIDGE_ADDRESS,
  SOL_BRIDGE_ADDRESS,
  SOL_TOKEN_BRIDGE_ADDRESS,
  WORMHOLE_RPC_HOST,
} from '../actions/constants'
import { useEthereumProvider } from '../contexts/EthereumProviderContext'

const Wormhole = () => {
  const eth = useEthereumProvider()
  const wallet = useWallet()
  const { connection } = useConnection()

  useEffect(() => {
    eth.connect()
  }, [])

  const onSwapSol = async () => {
    if (!wallet.publicKey) return
  }

  const onEthSol = async () => {
    const tokenAddress = '0xBA62BCfcAaFc6622853cca2BE6Ac7d845BC0f2Dc'
    if (!eth.signer || !wallet.publicKey || !wallet.signTransaction) return

    // shouldn't need to attest ETH -> whETH -> USDC
    // await attestFromEthereumToSolana(
    //     connection.connection,
    //     eth.signer,
    //     tokenAddress,
    //     wallet
    // );

    const solanaMintKey = new PublicKey(
      (await getForeignAssetSolana(
        connection,
        SOL_TOKEN_BRIDGE_ADDRESS,
        CHAIN_ID_ETH,
        hexToUint8Array(nativeToHexString(tokenAddress, CHAIN_ID_ETH) || '')
      )) || ''
    )
    console.log(`Solana Mint Key: ${solanaMintKey}`)

    const recipient = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      solanaMintKey,
      wallet.publicKey
    )

    console.log(`Recipient: ${recipient}`)
    // create the associated token account if it doesn't exist
    const associatedAddressInfo = await connection.getAccountInfo(recipient)
    if (!associatedAddressInfo) {
      const transaction = new Transaction().add(
        await Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          solanaMintKey,
          recipient,
          wallet.publicKey, // owner
          wallet.publicKey // payer
        )
      )
      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = wallet.publicKey
      // sign, send, and confirm transaction
      const signedTransaction = await wallet.signTransaction(transaction)
      const txid = await connection.sendRawTransaction(
        signedTransaction.serialize()
      )
      await connection.confirmTransaction(txid)
    }

    // approve
    const amount = parseUnits('1', 18)
    await approveEth(ETH_TOKEN_BRIDGE_ADDRESS, tokenAddress, eth.signer, amount)

    // create a signer for Eth
    const receipt = await transferFromEth(
      ETH_TOKEN_BRIDGE_ADDRESS,
      eth.signer,
      tokenAddress,
      amount,
      CHAIN_ID_SOLANA,
      hexToUint8Array(
        nativeToHexString(recipient.toString(), CHAIN_ID_SOLANA) || ''
      )
    )
    // get the sequence from the logs (needed to fetch the vaa)
    const sequence = await parseSequenceFromLogEth(receipt, ETH_BRIDGE_ADDRESS)
    console.log(sequence)

    const emitterAddress = getEmitterAddressEth(ETH_TOKEN_BRIDGE_ADDRESS)

    const { vaaBytes: signedVAA } = await getSignedVAAWithRetry(
      [WORMHOLE_RPC_HOST],
      CHAIN_ID_ETH,
      emitterAddress,
      sequence
    )

    await postVaaSolana(
      connection,
      wallet.signTransaction,
      SOL_BRIDGE_ADDRESS,
      wallet.publicKey.toString(),
      Buffer.from(signedVAA)
    )

    await getIsTransferCompletedSolana(
      SOL_TOKEN_BRIDGE_ADDRESS,
      signedVAA,
      connection
    )

    const transaction = await redeemOnSolana(
      connection,
      SOL_BRIDGE_ADDRESS,
      SOL_TOKEN_BRIDGE_ADDRESS,
      wallet.publicKey.toString(),
      signedVAA
    )

    const signed = await wallet.signTransaction(transaction)
    const txid = await connection.sendRawTransaction(signed.serialize())
    console.log(`transaction id: ${txid}`)
    await connection.confirmTransaction(txid)
  }

  return (
    <div>
      <Button onClick={onEthSol}>ETH -{'>'} Solana</Button>
      <Button onClick={onSwapSol}>Swap SOL</Button>
    </div>
  )
}

export default Wormhole
