// Overview page

import { Col, Row } from 'antd'
import React, { useEffect, useState } from 'react'
import VaultCard from '../components/VaultCard'
import styles from '../styles/overview.module.css'
import { DevnetPerp } from '../vaults/DEVNET-PERP'
import { useMerstab } from '../contexts/merstab'
import WelcomeModal from '../components/WelcomeModal'

import { getStorage } from '../services/storage.service'


const Overview = () => {

  const [start, setStart] = useState(true)
  useEffect(() => {
    //const cookie = useContext(StoreContext)
    const start = getStorage('start')
    setStart(Boolean(start))
  })

  const { client } = useMerstab()
  return (
    <div className={styles.overviewWrapper}>
      <div className="container">
        {/* <DynamicBackgroundNoSSR></DynamicBackgroundNoSSR> */}
        <Col className={styles.main}>
          <h1 className={styles.overviewHeader}>Liquidity Vaults</h1>
          <div className={styles.text}>
            Liquidity Vaults are pools of tokens used to provide liquidity to
            different decentralized derivatives Exchanges like Mango Markets or
            Zeta Markets
          </div>
          <Row className={styles.totalValueLocked}>$100,000 TVL</Row>
          <Row className={styles.vaults}>
            <VaultCard
              client={client}
              depositMint={DevnetPerp.depositMint}
              mTokenMint={DevnetPerp.mTokenMint}
              vault={DevnetPerp.vault}
            ></VaultCard>
          </Row>
        </Col>
      </div>
      {
        !start && (<WelcomeModal />)
      }
    </div>
  )
}

export default Overview
