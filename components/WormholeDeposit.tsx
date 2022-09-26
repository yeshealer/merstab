import { Button } from 'antd'
import React, { useEffect, useState } from 'react'
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
import { parseUnits } from 'ethers/lib/utils'
import {
  ETH_BRIDGE_ADDRESS,
  ETH_TOKEN_BRIDGE_ADDRESS,
  SOL_BRIDGE_ADDRESS,
  SOL_TOKEN_BRIDGE_ADDRESS,
  WORMHOLE_RPC_HOST,
} from '../actions/constants'
import { swap } from '../actions/orca'
import { useEthereumProvider } from '../contexts/EthereumProviderContext'
import { useOrca } from '../hooks/useOrca'
import styles from '../styles/WormholeDeposit.module.css'
import { toast, ToastOptions } from 'react-toastify'
import { Orca } from '@orca-so/sdk'

const toastOpts = {
  autoClose: 20000,
  position: 'bottom-left',
  theme: 'dark',
} as ToastOptions

interface WormholeDepositProps {
  depositAmount: number
}
const WormholeDeposit = (props: WormholeDepositProps) => {
  const { depositAmount } = props
  const eth = useEthereumProvider()
  const wallet = useWallet()
  const { connection } = useConnection()
  const orca: Orca = useOrca()
  const [signedVaa, setSignedVaa] = useState<Uint8Array>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    eth.connect()
  }, [eth])

  const onOrcaSwap = async () => {
    if (!wallet.publicKey) return
    const txId = await swap(orca, wallet.publicKey, 0.01, wallet, connection)
    console.log(`Orca swap tx: ${txId}`)
    toast.success('Swap on Orca completed, you can now despoit', toastOpts)
  }

  const onWormholeDeposit = async () => {
    const tokenAddress = '0xBA62BCfcAaFc6622853cca2BE6Ac7d845BC0f2Dc' // this should be ETH on mainnet
    if (!eth.signer || !wallet.publicKey || !wallet.signTransaction) return

    if (depositAmount == 0) {
      toast.error('You must enter an amount to send across chains', toastOpts)
      return
    }

    // shouldn't need to attest ETH -> whETH -> USDC
    // await attestFromEthereumToSolana(
    //     connection.connection,
    //     eth.signer,
    //     tokenAddress,
    //     wallet
    // );

    setIsLoading(true)
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
    const amount = parseUnits(depositAmount.toString(), 18)
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

    toast.success(
      'Transfer from Ethereum network complete, assets are briding to the Solana network\nThis could take some time.',
      toastOpts
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

    setSignedVaa(signedVAA)
    toast.success(
      'Solana message found. Please continue with Solana instructions to ',
      toastOpts
    )
    setIsLoading(false)
  }

  const onWormholeRedeem = async () => {
    if (
      !eth.signer ||
      !wallet.publicKey ||
      !wallet.signTransaction ||
      !signedVaa
    ) {
      toast.error(
        'An error occurred when redeeming your funds. Please use the wormhole recovery tool.',
        toastOpts
      )
      return
    }

    setIsLoading(true)
    await postVaaSolana(
      connection,
      wallet.signTransaction,
      SOL_BRIDGE_ADDRESS,
      wallet.publicKey.toString(),
      Buffer.from(signedVaa)
    )

    await getIsTransferCompletedSolana(
      SOL_TOKEN_BRIDGE_ADDRESS,
      signedVaa,
      connection
    )

    const transaction = await redeemOnSolana(
      connection,
      SOL_BRIDGE_ADDRESS,
      SOL_TOKEN_BRIDGE_ADDRESS,
      wallet.publicKey.toString(),
      signedVaa
    )

    const signed = await wallet.signTransaction(transaction)
    const txid = await connection.sendRawTransaction(signed.serialize())
    console.log(`transaction id: ${txid}`)
    await connection.confirmTransaction(txid)
    toast.success(
      `Your bridge to Solana has completed Tx: ${txid}. Now we can swap with Orcas AMMs to deposit USDC`,
      toastOpts
    )
    setSignedVaa(undefined)
    setIsLoading(false)
  }
  return (
    <>
      <Button
        onClick={signedVaa ? onWormholeRedeem : onWormholeDeposit}
        className={styles.actionButton}
      >
        {isLoading
          ? 'Waiting for transactions'
          : signedVaa
          ? 'Redeem'
          : 'Bridge'}
      </Button>

      <Button onClick={onOrcaSwap} className={styles.actionButton}>
        {isLoading ? 'Waiting for transactions' : 'Swap'}
      </Button>
    </>
  )
}

export default WormholeDeposit
