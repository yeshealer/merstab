import { Button, Row } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import styles from '../styles/VaultTransfer.module.css'
import Image from 'next/image'
import { useWallet } from '@solana/wallet-adapter-react'
import * as anchor from '@project-serum/anchor'
import { toast } from 'react-toastify'
import { PublicKey } from '@solana/web3.js'
import { useMerstab } from '../contexts/merstab'
import { VaultMetadata } from '../protocol/merstab'
import { writeVaultOp, checkWalletWhitelist } from '../helpers'

export interface VaultTransferProps {
  depositMint: PublicKey
  depositMintDecimals: number
  mTokenMint: PublicKey
  vault: PublicKey
}

const VaultTransfer = (props: VaultTransferProps) => {
  const [amount, setAmount] = useState(NaN)
  const [depositActive, setDepositActive] = useState<boolean>(true)
  const wallet = useWallet()

  const { client } = useMerstab()
  const [availableDepositToken, setAvailableDepositToken] =
    useState<number>(0.0)

  const [vaultDeposits, setVaultDeposits] = useState<number>(0)
  const [mTokenMint, setMToken] = useState<number>(0)
  const [pnl, setPnl] = useState(0.0)

  const [vaultMetadata, setVaultMetadata] = useState<VaultMetadata>(
    {} as VaultMetadata
  )

  const fetchBalances = useCallback(async () => {
    if (!client || !wallet || !wallet.publicKey) {
      console.log(`One of the following are undefined: ${client}, ${wallet}`)
      return
    }

    try {
      const depositTokenAccount = await client.getTokenAccount(
        props.depositMint,
        wallet.publicKey
      )
      if (depositTokenAccount) {
        const balance = await client.getTokenAccountBalance(
          depositTokenAccount.address
        )
        if (balance?.value?.uiAmount) {
          console.log(balance?.value?.uiAmount)
          setAvailableDepositToken(balance?.value?.uiAmount)
        } else {
          setAvailableDepositToken(0)
        }
      } else {
        setAvailableDepositToken(0)
      }
    } catch (e) {
      console.log('Error fetching deposit token balances: ', e)
      setAvailableDepositToken(0)
    }

    try {
      const vaultDepositTokenAccount = await client.getVaultDepositAccount(
        props.vault
      )
      if (vaultDepositTokenAccount) {
        const balance = await client.getTokenAccountBalance(
          vaultDepositTokenAccount.address
        )
        if (balance?.value?.uiAmount) {
          console.log(balance?.value?.uiAmount)
          setVaultDeposits(balance?.value?.uiAmount)
        } else {
          setVaultDeposits(0)
        }
      } else {
        setVaultDeposits(0)
      }
    } catch (e) {
      console.log('Error fetching vault deposit token balances: ', e)
      setVaultDeposits(0)
    }

    try {
      const merstabDepositTokenAccount = await client.getMTokenAccount(
        props.mTokenMint,
        wallet.publicKey
      )
      console.log(`vault deposits: ${merstabDepositTokenAccount.address}`)

      if (merstabDepositTokenAccount) {
        const balance = await client.getTokenAccountBalance(
          merstabDepositTokenAccount.address
        )
        if (balance?.value?.uiAmount) {
          setMToken(balance?.value?.uiAmount)
        } else {
          setMToken(0)
        }
      } else {
        setMToken(0)
      }
    } catch (e) {
      console.log('Error fetching merstab deposit token balances: ', e)
      setMToken(0)
    }
  }, [client, wallet])

  const fetchVault = useCallback(async () => {
    if (!client || !wallet || !wallet.publicKey) {
      console.log(`One of the following are undefined: ${client}, ${wallet}`)
      return
    }

    try {
      const vault = await client.getVaultData(props.vault)
      if (vault) {
        setVaultMetadata(vault as VaultMetadata)
        console.log(vault)
      } else {
        console.log('No vault account')
      }
    } catch (err) {
      console.log(err)
    }
  }, [client, wallet])

  const fetchPnlInfo = useCallback(async () => {
    if (!client || !wallet || !wallet.publicKey) {
      console.log(`One of the following are undefined: ${client}, ${wallet}`)
      return
    }

    try {
      const { pnl } = await client.getPnl(
        wallet.publicKey,
        props.vault,
        props.mTokenMint
      )
      if (pnl) {
        console.log('pnl:', pnl)
        setPnl(pnl)

        // console.log("pnl percentage:", pnlInfo.pnlPercentage);
        // setPnlPercent(pnlInfo.pnlPercentage);
      } else {
        console.log('No pnl info')
      }
    } catch (err) {
      console.log(err)
    }
  }, [client, wallet, props.vault, props.depositMint])

  useEffect(() => {
    fetchBalances()
    fetchVault()
    fetchPnlInfo()
  }, [/*client, wallet, */ fetchBalances, fetchVault, fetchPnlInfo])

  const onInputChange = (event: any) => {
    const amount = parseFloat(event.target.value)
    if (amount !== NaN) setAmount(amount)
    else setAmount(NaN)
  }
  const onTabToggle = (toggle: boolean) => {
    setDepositActive(toggle)
    setAmount(NaN)
  }

  const onInteract = async () => {
    if (!wallet || !wallet.publicKey || !client) {
      console.log('Error establishing connection')
      console.log({ wallet, client })
      console.log('Attempting to establish connection to wallet')
      await wallet.connect()

      if (!wallet || !wallet.publicKey || !client) return
    }
    if (!(await checkWalletWhitelist(wallet.publicKey.toString()))) {
      toast.error(`This wallet is not whitelisted.`, { theme: 'dark' })
      return
    }
    if (depositActive) {
      if (amount < 50) {
        toast.error(
          `${amount} USDC less than minimum deposit amount of 50 USDC`,
          { theme: 'dark' }
        )
        return
      }
      const programAmount = amount * 10 ** props.depositMintDecimals
      try {
        await client.stake(
          new anchor.BN(programAmount),
          wallet.publicKey,
          props.vault,
          props.depositMint,
          null,
          wallet.sendTransaction
        )
        toast.success('Deposit Successful', {
          theme: 'dark',
        })
        writeVaultOp(
          wallet.publicKey.toString(),
          'stake',
          amount,
          props.vault.toString()
        ).catch((err) => {
          console.log(err)
        })
      } catch (err) {
        console.log(err)
        toast.error(
          `Error depositing ${amount} into vault: ${props.vault
            .toString()
            .substring(props.vault.toString().length - 4)}`,
          { theme: 'dark' }
        )
      }
    } else {
      const programAmount = amount * 10 ** props.depositMintDecimals
      try {
        if (amount > vaultDeposits) {
          const futDate = new Date()
          futDate.setHours(24, 0, 0, 0)
          writeVaultOp(
            wallet.publicKey.toString(),
            'unstake',
            amount,
            props.vault.toString()
          )
            .then(() => {
              toast.success(
                `Withdraw scheduled for ${futDate
                  .toISOString()
                  .toString()}. Please try again tomorrow to withdraw your funds.`,
                {
                  theme: 'dark',
                }
              )
            })
            .catch((err) => {
              console.log(err)
              toast.error(
                `Error withdrawing ${amount} from vault: ${props.vault
                  .toString()
                  .substring(props.vault.toString().length - 4)} server error`,
                { theme: 'dark' }
              )
            })
        }
        await client.unstake(
          new anchor.BN(programAmount),
          wallet.publicKey,
          props.vault,
          props.depositMint
        )
        toast.success('Withdrawal Successful', {
          theme: 'dark',
        })
      } catch (err) {
        console.log(err)
        toast.error(
          `Error withdrawing ${amount} from vault: ${props.vault
            .toString()
            .substring(props.vault.toString().length - 4)}`,
          { theme: 'dark' }
        )
      }
    }
    fetchBalances()
  }

  const setMax = () => {
    const max = depositActive ? availableDepositToken : mTokenMint
    setAmount(max)
  }

  return (
    <div className={styles.transferSection}>
      <div className={styles.innerTransfer}>
        <Row className={styles.buttonRow}>
          <Button
            onClick={() => onTabToggle(true)}
            className={`${styles.transactionButton} ${
              depositActive ? styles.active : ''
            }`}
          >
            DEPOSIT
          </Button>
          <Button
            onClick={() => onTabToggle(false)}
            className={`${styles.transactionButton} ${
              !depositActive ? styles.active : ''
            }`}
          >
            WITHDRAW
          </Button>
        </Row>
        <Row
          className={`${styles.availableDepositTokenRow} ${styles.availableDepositToken}`}
        >
          <Row>Your Position: </Row>
          <Row>
            <span>{mTokenMint} USDC</span>
            {/* <span>0 USDC</span> */}
          </Row>
        </Row>

        <Row>
          <div className={styles.valueInputRow}>
            <Button onClick={setMax} className={styles.maxButton}>
              MAX
            </Button>
            <input
              type="number"
              className={styles.amountField}
              placeholder={depositActive ? 'min. 50' : '0.0'}
              value={amount.toString()}
              onChange={onInputChange}
            ></input>
            <Image
              alt=""
              className={styles.currencyIcon}
              src="/svg/usdc.svg"
              width={20}
              height={20}
            ></Image>
            <div className={styles.spacer}></div>
          </div>
        </Row>
        <Row
          className={`${styles.availableDepositTokenRow} ${styles.availableDepositToken} ${styles.walletBalance}`}
        >
          {depositActive ? (
            <Row className={styles.walletBalanceContainer}>
              <Row className={styles.walletBalanceText}>Wallet balance: </Row>
              <Row>
                <span className={styles.walletBalanceText}>
                  {availableDepositToken} USDC
                </span>
              </Row>{' '}
            </Row>
          ) : (
            <Row className={styles.walletBalanceContainer}>
              <Row className={styles.amountEarned}>Amount Earned: </Row>
              <Row>
                {pnl <= 0 ? (
                  <span className={styles.amountEarnedPos}>+ {pnl} </span>
                ) : (
                  <span className={styles.amountEarnedNeg}>{pnl} </span>
                )}
                <span className={styles.amountEarned}>USDC</span>
              </Row>
            </Row>
          )}
        </Row>
        <Row className={styles.displayRow}>
          <Button
            onClick={onInteract}
            className={styles.actionButton}
            disabled={
              depositActive
                ? !(wallet.connected && amount >= 50)
                : !wallet.connected
            }
          >
            {depositActive ? 'DEPOSIT' : 'WITHDRAW'}
          </Button>
        </Row>
        {/* <Row className={styles.displayRow}>
                    <WormholeDeposit depositAmount={amount}></WormholeDeposit>
                </Row> */}
        <Row className={styles.bottomRow}>
          {depositActive ? (
            <span className={styles.fundsProcessingRow}>
              Deposits are processed once a day at 12am UTC.
            </span>
          ) : (
            <Row className={styles.walletBalanceContainer}>
              <Row className={styles.fundsProcessingRow}>
                Funds available in:
              </Row>
              <Row className={styles.fundsProcessingRow}>05:36:22</Row>
            </Row>
          )}
        </Row>
      </div>
    </div>
  )
}

export default VaultTransfer
