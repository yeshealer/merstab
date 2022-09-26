import Link from 'next/link'
import { Progress } from 'antd'
import styles from './index.module.css'

const ProductSection = () => {
  return (
    <section id="product" className={styles.ourProductsRow}>
      <div className={styles.btwGradient}></div>
      <div className="container">
        <div className={styles.flexColumnProducts}>
          <h2 className={styles.productTitle}>OUR PRODUCTS</h2>
          <div className={styles.ourProductsSection}>
            <div className={`${styles.text} ${styles.flexColumn}`}>
              <h1 className={styles.perpHeader}>Liquidity Vault</h1>
              <div className={styles.btcPerpDescription}>
                Provides liquidity to perpetual swaps and futures on
                decentralized derivatives exchanges like Mango Markets and Zeta
                Markets
              </div>
            </div>
            <Link href={'/vaults/DEVNETPERP'}>
              <div className={styles.marketMakingVault}>
                <div
                  className={styles.vaultHeader}
                  style={{ alignSelf: 'center', paddingBottom: 20 }}
                >
                  SOL-PERP
                </div>
                <div className={styles.cryptocurrencyIcon}>
                  <img
                    alt="Cryptocurency"
                    src="/svg/cryptocurrency.svg"
                    width={180}
                    height={180}
                  />
                </div>
                <div className={styles.apy}>
                  92.1% <span className={styles.vaultText}>Projected Apy</span>
                </div>
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      paddingBottom: 8,
                    }}
                  >
                    <span className={styles.vaultText}>Deposits</span>
                    <span className={styles.vaultText}>223,601 USDC</span>
                  </div>
                  <Progress
                    strokeColor="linear-gradient(112.42deg, #2723E2 7.74%, #AF09D9 90.58%)"
                    strokeLinecap="square"
                    trailColor="#474747"
                    percent={23}
                    showInfo={false}
                  />
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      paddingTop: 8,
                    }}
                  >
                    <span className={styles.vaultText}>Capacity</span>
                    <span className={styles.vaultText}>1,000,000 USDC</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductSection
