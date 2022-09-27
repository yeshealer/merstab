// @ts-ignore
import {
  getMint,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMint,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
} from '../node_modules/@solana/spl-token'
import * as anchor from '@project-serum/anchor'
import {
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
} from '@solana/web3.js'
import idl from './idls/merstab_protocol.json'
import { getYesterdayDateString, getMangoAccountEquity } from '../helpers'
import { rpc } from '@certusone/wormhole-sdk'

export interface VaultMetadata {
  manager: PublicKey
  mint: PublicKey
  name: string
  limit: anchor.BN
  depositEquity: anchor.BN
}

export interface StatsMetadata {
  equity: anchor.BN
  bump: number
}

/**
 * Wallet interface for objects that can be used to sign provider transactions.
 */
export interface Wallet {
  signTransaction: (transaction: Transaction) => Promise<Transaction>
  signAllTransactions: (transaction: Transaction[]) => Promise<Transaction[]>
  publicKey: PublicKey
}
export class MerstabClient {
  connection: anchor.web3.Connection
  constructor(public program: anchor.Program, public network: string) {
    this.connection = program.provider.connection
  }

  static async connect(
    provider: anchor.AnchorProvider,
    network: string
  ): Promise<MerstabClient> {
    const program = new anchor.Program(
      idl as any,
      MerstabClient.MERSTAB_ID,
      provider
    )
    // console.log("here")
    // console.log("total supply: ", await program.provider.connection.getTotalSupply())
    return new MerstabClient(program, network)
  }
  static MERSTAB_ID = new PublicKey(
    'AQPDVpAsDtd8cfXVjrUEKrhchF4cYwST2wyq3tJa82ci'
  )
  static MANGO_OWNER_PDA_SEED = 'mango_owner_pda_seed'
  static STAKED_TOKENS_PDA_SEED = 'staked_token_mint_authority'
  static VAULT_SEED = 'vault-seed'
  static STATS_SEED = 'stats_seed'
  static DECIMALS = 6

  async getTokenAccount(quoteMint: PublicKey, wallet: PublicKey) {
    const mUSDCStakerAccount = await getAssociatedTokenAddress(
      quoteMint,
      wallet
    )
    return await getAccount(this.connection, mUSDCStakerAccount)
  }

  async getTokenAccountBalance(tokenAccount: PublicKey) {
    return await this.connection.getTokenAccountBalance(tokenAccount)
  }

  async getMTokenAccount(mTokenMint: PublicKey, wallet: PublicKey) {
    const mUSDCStakerAccount = await getAssociatedTokenAddress(
      mTokenMint,
      wallet,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
    return await getAccount(this.connection, mUSDCStakerAccount)
  }

  async getVaultDepositAccount(vault: PublicKey) {
    const [account, bump] = await this.deriveVaultAccount(vault)
    return await getAccount(this.connection, account)
  }

  async getVaultData(key: PublicKey): Promise<VaultMetadata> {
    return (await this.program.account.vault.fetch(
      key
    )) as unknown as VaultMetadata
  }

  async getStatsData(key: PublicKey): Promise<StatsMetadata> {
    return (await this.program.account.stats.fetch(
      key
    )) as unknown as StatsMetadata
  }

  async deriveMangoAccount(vault: PublicKey) {
    return await PublicKey.findProgramAddress(
      [
        Buffer.from(
          anchor.utils.bytes.utf8.encode(MerstabClient.MANGO_OWNER_PDA_SEED)
        ),
        vault.toBytes(),
      ],
      this.program.programId
    )
  }

  async deriveVaultAccount(vault: PublicKey) {
    return await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode(MerstabClient.VAULT_SEED)),
        vault.toBytes(),
      ],
      this.program.programId
    )
  }

  async deriveMTokenAuthority(vault: PublicKey) {
    return await PublicKey.findProgramAddress(
      [
        Buffer.from(
          anchor.utils.bytes.utf8.encode(MerstabClient.STAKED_TOKENS_PDA_SEED)
        ),
        vault.toBytes(),
      ],
      this.program.programId
    )
  }

  async deriveStatsAccount(wallet: PublicKey, vault: PublicKey) {
    return await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode(MerstabClient.STATS_SEED)),
        wallet.toBytes(),
        vault.toBytes(),
      ],
      this.program.programId
    )
  }

  // node helper function
  async addVault(
    vaultName: string,
    wallet: Keypair,
    limit: number,
    depositMint: string
  ) {
    const vault = Keypair.generate()
    console.log(`New vault public key ${vault.publicKey.toString()}`)

    const [mangoOwnerPDA, mangoOwnerBump] = await this.deriveMangoAccount(
      vault.publicKey
    )
    const [tokenAccountPDA, tokenAccountBump] = await this.deriveVaultAccount(
      vault.publicKey
    )

    const stakedMint = await createMint(
      this.connection,
      wallet,
      wallet.publicKey,
      wallet.publicKey,
      6,
      anchor.web3.Keypair.generate(),
      undefined,
      TOKEN_PROGRAM_ID
    )
    console.log(`Staked token mint: ${stakedMint.toString()}`)

    // generated by me
    const quoteMint = new PublicKey(depositMint)

    this.program.methods
      .addVault(vaultName, new anchor.BN(limit), mangoOwnerBump)
      .accounts({
        vault: vault.publicKey,
        manager: wallet.publicKey,
        tokenAccount: tokenAccountPDA,
        tokenAccountAuthority: mangoOwnerPDA,
        stakedTokenMint: stakedMint,
        payer: wallet.publicKey,
        mint: quoteMint,
        rent: SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([vault, wallet])
      .rpc()
  }

  async stake(
    amount: anchor.BN,
    wallet: PublicKey,
    vaultPk: PublicKey,
    depositMint: PublicKey,
    keypair?: Keypair | null,
    sendTransaction?: Function
  ) {
    // get these values from add vault
    const vault = vaultPk
    const vaultData: VaultMetadata = await this.getVaultData(vault)
    const merstabUSDCMint = await getMint(
      this.connection,
      vaultData.mint,
      'confirmed',
      TOKEN_PROGRAM_ID
    )

    // init tx
    const tx = new Transaction()

    const mUSDCStakerAccount = await getAssociatedTokenAddress(
      merstabUSDCMint.address,
      wallet
    )

    try {
      const merstabTokenAccountInfo = await getAccount(
        this.connection,
        mUSDCStakerAccount
      )
      console.log(
        `Found token account existing for mint: ${mUSDCStakerAccount.toString()}`
      )
    } catch (err) {
      console.log(err)
      console.log(
        `Could not find token account for mint ${merstabUSDCMint.address.toString()} and wallet ${wallet.toString()}`
      )
      console.log(`Creating token account ${mUSDCStakerAccount.toString()}`)

      const ataIx = createAssociatedTokenAccountInstruction(
        wallet,
        mUSDCStakerAccount,
        wallet,
        merstabUSDCMint.address
      )
      tx.add(ataIx)
      console.log('Token account created')
    }

    const walletUSDCAccount = await getAssociatedTokenAddress(
      depositMint,
      wallet,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
    const [tokenAccountPDA, tokenAccountBump] = await this.deriveVaultAccount(
      vault
    )
    const [stakedTokenMintPDA, stakedTokenMintBump] =
      await this.deriveMTokenAuthority(vault)

    const [stakerStatsPDA, stakerStatsBump] = await this.deriveStatsAccount(
      wallet,
      vault
    )

    console.log('vault: ', vault.toString())
    console.log('vaultTokenAccount: ', tokenAccountPDA.toString())
    console.log('stakersTokenAccount: ', walletUSDCAccount.toString())
    console.log('stakersAta: ', mUSDCStakerAccount.toString())
    console.log(
      'stakedTokenMintAuthority: ',
      merstabUSDCMint.mintAuthority.toString()
    )
    console.log('staker: ', wallet.toString())
    console.log('stats: ', stakerStatsPDA.toString())
    console.log('stakedTokenMint: ', merstabUSDCMint.address.toString())

    try {
      const ix = await this.program.methods
        .stake(amount, tokenAccountBump, stakedTokenMintBump)
        .accounts({
          vault: vault,
          vaultTokenAccount: tokenAccountPDA, // vault USDC
          stakersTokenAccount: walletUSDCAccount, // user USDC
          stakersAta: mUSDCStakerAccount, // user merUSDC
          stakedTokenMintAuthority: merstabUSDCMint.mintAuthority, // should be same as mUSDCMint.mintAuthority
          staker: wallet,
          stats: stakerStatsPDA,
          stakedTokenMint: merstabUSDCMint.address,
          tokenProgram: TOKEN_PROGRAM_ID,
          SystemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction()
      tx.add(ix)

      if (sendTransaction) {
        console.log('if sendTransaction')
        const signature = await sendTransaction(tx, this.connection)
        console.log(`txhash: ${signature}`)
        await this.connection.confirmTransaction(signature, 'processed')
      } else {
        console.log('else')
        const txId = await sendAndConfirmTransaction(this.connection, tx, [
          keypair as anchor.web3.Signer,
        ])
        console.log(`txhash: ${txId}`)
        return txId
      }
    } catch (err) {
      console.log(err)
      throw err
    }
  }

  async unstake(
    amount: anchor.BN,
    wallet: PublicKey,
    vaultPk: PublicKey,
    withdrawMint: PublicKey,
    keypair?: Keypair | null,
    sendTransaction?: Function
  ) {
    // get these values from add vault
    const vault = vaultPk
    const vaultData: VaultMetadata = await this.getVaultData(vault)
    const merstabUSDCMint = vaultData.mint

    const mUSDCMint = await getMint(
      this.connection,
      merstabUSDCMint,
      undefined,
      TOKEN_PROGRAM_ID
    )
    const mUSDCStakerAccount = await getAssociatedTokenAddress(
      merstabUSDCMint,
      wallet
    )

    try {
      const mUSDCAccountInfo = await getAccount(
        this.connection,
        mUSDCStakerAccount
      )
      console.log(
        `Found token account existing for mint: ${mUSDCStakerAccount.toString()}`
      )
    } catch (err) {
      console.log(err)
      console.log(
        `Could not find token account ${mUSDCStakerAccount.toString()}`
      )
      throw new Error('Account does not exist')
    }

    const walletUSDCAccount = await getAssociatedTokenAddress(
      withdrawMint,
      wallet,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
    const [mangoOwnerPDA, mangoOwnerBump] = await this.deriveMangoAccount(vault)
    const [tokenAccountPDA, tokenAccountBump] = await this.deriveVaultAccount(
      vault
    )
    const [stakedTokenMintPDA, stakedTokenMintBump] =
      await this.deriveMTokenAuthority(vault)

    const [stakerStatsPDA, stakerStatsBump] = await this.deriveStatsAccount(
      wallet,
      vault
    )

    try {
      const ix = await this.program.methods
        .unstake(new anchor.BN(amount), mangoOwnerBump, stakerStatsBump)
        .accounts({
          vault: vault,
          vaultTokenAccount: tokenAccountPDA,
          vaultTokenAuthority: mangoOwnerPDA,
          stakersTokenAccount: walletUSDCAccount,
          stakersAta: mUSDCStakerAccount,
          stakedTokenMintAuthority: stakedTokenMintPDA,
          staker: wallet,
          stats: stakerStatsPDA,
          stakedTokenMint: merstabUSDCMint,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .instruction()
      const tx = new Transaction().add(ix)

      if (sendTransaction) {
        const signature = await sendTransaction(tx, this.connection)
        console.log(`txhash: ${signature}`)
        await this.connection.confirmTransaction(signature, 'processed')
        return signature.hash
      } else {
        const txId = await sendAndConfirmTransaction(this.connection, tx, [
          keypair as anchor.web3.Signer,
        ])
        console.log(`txhash: ${txId}`)
        return txId
      }
    } catch (err) {
      console.log(err)
      throw err
    }
  }

  async getPnl(wallet: PublicKey, vaultPk: PublicKey, stakedMintPk: PublicKey) {
    const [stakerStatsPDA, stakerStatsBump] = await this.deriveStatsAccount(
      wallet,
      vaultPk
    )

    const [tokenAccountPDA, tokenAccountBump] = await this.deriveVaultAccount(
      vaultPk
    )
    const vaultTokenAccount = await getAccount(
      this.connection,
      tokenAccountPDA,
      undefined,
      TOKEN_PROGRAM_ID
    )
    const vaultTokenAccountBalance =
      (parseInt(vaultTokenAccount.amount.toString()) * 1) /
      Math.pow(10, MerstabClient.DECIMALS)

    const stakerStakeAcct = await this.getMTokenAccount(stakedMintPk, wallet)

    const vault = await this.getVaultData(vaultPk)

    const todayAcctEquity: number = await getMangoAccountEquity(
      'Fx47D6dj5EzKgGasgdPkPxfcDQY9SRUaxPjgLUWuLxwX',
      getYesterdayDateString()
    )

    const stakedMint = await getMint(
      this.connection,
      vault.mint,
      undefined,
      TOKEN_PROGRAM_ID
    )
    const stakedTokenMintSupply =
      (parseInt(stakedMint.supply.toString()) * 1) /
      Math.pow(10, MerstabClient.DECIMALS)

    const vaultExchangeRate =
      (vaultTokenAccountBalance + todayAcctEquity) / stakedTokenMintSupply
    console.log('vaultExchangeRate: ', vaultExchangeRate)

    const stats = await this.getStatsData(stakerStatsPDA)

    const stakerEquity =
      (stats.equity.toNumber() * 1) / Math.pow(10, MerstabClient.DECIMALS)
    console.log('equity: ', stakerEquity)

    const stakedTokens =
      (parseInt(stakerStakeAcct.amount.toString()) * 1) /
      Math.pow(10, MerstabClient.DECIMALS)
    console.log('staked tokens: ', stakedTokens)

    const pnl = stakedTokens * vaultExchangeRate - stakerEquity
    console.log('pnl ($): ', stakedTokens * vaultExchangeRate - stakerEquity)

    const pnlPercentage =
      ((stakedTokens * vaultExchangeRate - stakerEquity) / stakerEquity) * 100
    console.log(
      'pnl (%): ',
      ((stakedTokens * vaultExchangeRate - stakerEquity) / stakerEquity) * 100
    )

    return { pnl, pnlPercentage }
  }

  async getApy(vaultPk: PublicKey): Promise<number> {
    const vault = await this.getVaultData(vaultPk)

    // uncomment this once demos are over
    // const initialAcctEquity = parseInt(vault.depositEquity.toString())
    const initialAcctEquity = 303
    console.log('initial account equity: ', initialAcctEquity)
    const compoundingRate = 365

    try {
      const todayAcctEquity: number = await getMangoAccountEquity(
        'Fx47D6dj5EzKgGasgdPkPxfcDQY9SRUaxPjgLUWuLxwX',
        getYesterdayDateString()
      )

      const apy =
        (Math.pow(1 + todayAcctEquity! / initialAcctEquity, compoundingRate) -
          1) *
        100
      console.log(`APY: ${apy}%`)
      return apy
    } catch (e) {
      console.log('trouble getting apy')
      console.log('error:', e)
      return 0
    }
  }
}
