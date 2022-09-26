import { Connection, PublicKey } from '@solana/web3.js'
import { Network, Orca, OrcaPoolConfig, TransactionPayload } from '@orca-so/sdk'
import Decimal from 'decimal.js'
import { WalletContextState } from '@solana/wallet-adapter-react'
// import { solUsdcPool } from "@orca-so/sdk/dist/constants/devnet/pools";
import { TokenSwap } from '@solana/spl-token-swap'

export const swap = async (
  orca: Orca,
  owner: PublicKey,
  amount: number,
  wallet: WalletContextState,
  connection: Connection
) => {
  /*** Swap ***/
  // 3. We will be swapping 0.1 SOL for some ORCA
  const whETHUSDCPool = orca.getPool(OrcaPoolConfig.ORCA_SOL)
  const whETH = whETHUSDCPool.getTokenB()
  const whETHAmount = new Decimal(amount)
  const quote = await whETHUSDCPool.getQuote(whETH, whETHAmount)
  const usdcAmount = quote.getMinOutputAmount()
  console.log(
    `Swap ${whETHAmount.toString()} whETH for at least ${usdcAmount.toNumber()} USDC`
  )
  const swapPayload: TransactionPayload = await whETHUSDCPool.swap(
    owner,
    whETH,
    whETHAmount,
    usdcAmount
  )
  const tx = await wallet.sendTransaction(swapPayload.transaction, connection, {
    signers: swapPayload.signers,
    skipPreflight: true,
  })
  console.log('Swapped:', tx, '\n')
  return tx
}
