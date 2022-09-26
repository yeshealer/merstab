import { Col, Progress, Row } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import styles from '../styles/VaultDepositsInfo.module.css'
import Image from 'next/image'
import * as anchor from '@project-serum/anchor'
import { useMerstab } from '../contexts/merstab'
import { PublicKey } from '@solana/web3.js'
import { VaultMetadata } from '../protocol/merstab'

export interface VaultDepositsInfoProps {
  vault: PublicKey
}

const VaultDepositsInfo = (props: VaultDepositsInfoProps) => {
  const { client } = useMerstab()
  const [vaultDeposits, setVaultDeposits] = useState<number>(0)
  const [vaultDecimals, setVaultDecimals] = useState<number>(6)

  const [vaultMetadata, setVaultMetadata] = useState<VaultMetadata>({
    manager: PublicKey.default,
    mint: PublicKey.default,
    name: '',
    limit: new anchor.BN(0),
  } as VaultMetadata)

  const [vaultBar, setVaultBar] = useState<number>(0)
  const [vaultCap, setVaultCap] = useState<number>(0)

  const fetchBalances = useCallback(async () => {
    if (!client) return
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
          setVaultDecimals(balance?.value?.decimals)
        } else {
          setVaultDeposits(0)
        }
      } else {
        setVaultDeposits(0)
      }
    } catch (err) {
      console.log(err)
    }
  }, [client, props.vault])

  const fetchVault = useCallback(async () => {
    if (!client) return
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
  }, [client, props.vault])

  useEffect(() => {
    fetchVault()
    fetchBalances()
  }, [/*client, props.vault, */ fetchBalances, fetchVault])

  useEffect(() => {
    const bar =
      ((vaultDeposits * 10 ** vaultDecimals) / vaultMetadata.limit.toNumber()) *
      100
    setVaultBar(bar)
    setVaultCap(vaultMetadata.limit.toNumber() / 10 ** vaultDecimals)
  }, [vaultDeposits, vaultDecimals, vaultMetadata])

  return (
    <div className={styles.vaultDepositInfo}>
      <div className={styles.infoAssetIcon}>
        <Image
          src="/svg/cryptocurrency.svg"
          alt="cryptocurrency and usdc pair"
          width={100}
          height={100}
        ></Image>
        <div
          style={{ display: 'flex', flexDirection: 'column', marginLeft: 20 }}
        >
          <span className={styles.depositInfoTle}>SOL-PERP</span>
          <span className={styles.depositInfoSmTle}>Liquidity Vault</span>
        </div>
      </div>

      <Col className={styles.vaultDepositsStatus}>
        <Row
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingBottom: 8,
          }}
        >
          <div className={styles.depositInfo}>
            <span className="onlyPc">CURRENT VAULT</span>
            <span> DEPOSITS</span>
          </div>
          <div className={styles.depositInfo}>{vaultDeposits} USDC</div>
        </Row>
        <Row>
          <Progress
            strokeColor="linear-gradient(112.42deg, #2723E2 7.74%, #AF09D9 90.58%)"
            strokeLinecap="square"
            trailColor="#1A1A1A"
            percent={vaultBar}
            showInfo={false}
            className={styles.progressBar}
          />
        </Row>
        <Row
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: 8,
          }}
        >
          <span className={styles.depositInfo}>
            <span className="onlyPc">VAULT </span>CAPACITY
          </span>
          <span className={styles.depositInfo}>{vaultCap} USDC</span>
        </Row>
      </Col>
    </div>
  )
}

export default VaultDepositsInfo
