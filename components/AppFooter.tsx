import React from 'react'
import styles from '../styles/AppFooter.module.css'
import indexStyles from '../styles/index.module.css'

const AppFooter = () => {
  return (
    <div className={styles.footerContainer}>
      <div className={styles.container}>
        <div className={styles.footerRow}>
          <a href={'/'}>
            <div className={indexStyles.betaLogo}>
              <img
                src="/magic/logo.png"
                alt="logo"
                width={60}
                height={30}
              />
              <div className={styles.betaDiv}>
                <span className={styles.beta}>beta</span>
              </div>
            </div>
          </a>
          <div className={styles.icons}>
            <a
              href="https://twitter.com/merstab"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="/svg/twitter.svg"
                alt="twitter icon"
                height={24}
                width={24}
              />
            </a>
            <a
              href="https://discord.gg/Nhn8YbsgaE"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="/svg/discord.svg"
                alt="discord icon"
                height={24}
                width={24}
              />
            </a>
          </div>
        </div>
      </div>
      <div className={styles.footerBg}></div>
    </div>
  )
}

export default AppFooter
