import React, { useState, useEffect } from 'react'
import StrategyInfo from '../../components/StrategyInfo'
import VaultDepositsInfo from '../../components/VaultDepositsInfo'
import VaultPerformanceInfo from '../../components/VaultPerformanceInfo'
import VaultTransfer from '../../components/VaultTransfer'
import styles from '../../styles/Vault.module.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { DevnetPerp } from '../../vaults/DEVNET-PERP'
import WelcomeModal from '../../components/WelcomeModal'

import { getStorage } from '../../services/storage.service'

const Vault = () => {

  const [start, setStart] = useState(true)
  useEffect(() => {
    //const cookie = useContext(StoreContext)
    const start = getStorage('start')
    setStart(Boolean(start))
  })

  const depositMint = DevnetPerp.depositMint
  const depositMintDecimals = DevnetPerp.depositMintDecimals
  const mTokenMint = DevnetPerp.mTokenMint
  const vaultPk = DevnetPerp.vault

  return (
    <>
      <div className={styles.vaultPageWrapper}>
        <div className="container">
          <div className={styles.vaultSection}>
            <div className={styles.vaultDeposits}>
              <VaultDepositsInfo vault={vaultPk}></VaultDepositsInfo>
            </div>
            <div className={styles.vaultPerformance}>
              <VaultPerformanceInfo
                mTokenMint={mTokenMint}
                vault={vaultPk}
              ></VaultPerformanceInfo>
            </div>
            <div className={styles.vaultTransactions}>
              <div className="sp">
                <VaultTransfer
                  depositMint={depositMint}
                  mTokenMint={mTokenMint}
                  vault={vaultPk}
                  depositMintDecimals={depositMintDecimals}
                ></VaultTransfer>
              </div>
              <StrategyInfo></StrategyInfo>
              <div className={styles.transferSection + ' pc'}>
                <VaultTransfer
                  depositMint={depositMint}
                  mTokenMint={mTokenMint}
                  vault={vaultPk}
                  depositMintDecimals={depositMintDecimals}
                ></VaultTransfer>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer></ToastContainer>
      {!start && (<WelcomeModal />)}

    </>
  )
}

export default Vault
