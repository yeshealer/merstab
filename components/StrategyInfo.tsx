import React from 'react'
import styles from '../styles/StrategyInfo.module.css'

const StrategyInfo = () => {
  return (
    <div className={styles.infoSection}>
      <div className={styles.infoStep}>
        <p className={styles.sectionHeader}>VAULT DETAILS</p>
        <p className={styles.sectionText}>
          This liquidity vault accepts USDC deposits and generates yield by
          deploying liquidity to derivatives exchanges. The liquidity algorithm
          works by first depositing USDC on Mango Markets and then placing limit
          orders on buy and sell-side to earn the bid-ask spread. The algorithm
          is actively monitoring the markets to manage risk.
        </p>
      </div>
      <div className={styles.infoStep}>
        <p className={styles.sectionHeader}>RISK</p>
        <p className={styles.sectionText}>
          The risk involved with order book-based liquidity provision is called
          inventory risk. Inventory risk is the probability that the LP vault
          can't find buyers for their inventory, resulting in the risk of
          holding more of an asset at exactly the wrong time, e.g. accumulating
          assets when prices are falling or selling too early when prices are
          rising. However, our liquidity vault is trying to mitigate risk by
          actively monitoring the markets.
        </p>
      </div>
      <div className={styles.infoStep}>
        <p className={styles.sectionHeader}>WITHDRAWALS</p>
        <p className={styles.sectionText}>
          Deposits and withdrawals are processed once a day at 12am UTC. Any
          requests coming in after 11.30pm UTC will be processed the next day.
        </p>
      </div>
    </div>
  )
}

export default StrategyInfo
