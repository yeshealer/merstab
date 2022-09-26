import Link from 'next/link'
import Head from 'next/head'
import { forwardRef } from 'react'
import styles from './index.module.css'

const HomeSection = forwardRef<HTMLElement>((props, ref) => {
  return (
    <section id="home" ref={ref}>
      <Head>
        <title>Merstab | Home</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="container">
        <div className={styles.startEarningRow}>
          <div className={styles.startEarningSection}>
            <div className={styles.earnYieldHeader}>
              <span className={styles.gardientYieldHeader}>
                Liquidity Protocol <br />
              </span>
              For DeFi Derivatives
            </div>
            <p>Provide liquidity to perps, futures and options</p>
            <Link href="/overview">
              <a>
                <button className={styles.yieldButton}>START STAKING</button>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
})

export default HomeSection
