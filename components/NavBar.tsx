/* eslint-disable prettier/prettier */
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import styles from '../styles/NavBar.module.css'
import indexStyles from '../styles/index.module.css'
import { Button } from 'antd'
import LogoSVG from '../public/svg/logo'

const NavBar = () => {
  const wallet = useWallet()
  const router = useRouter()

  const [showDropDown, setShowDropDown] = useState(false)

  return (
    <>
      {router.pathname !== '/' ? (
        <section className={styles.navRowBoxShadow}>
          <div className={styles.navRow + ' container'}>
            <div className={styles.icon}>
              <Link href={'/'}>
                <div className={indexStyles.betaLogo}>
                  <img
                    src="/magic/logo.png"
                    alt="logo"
                    width={75}
                    height={35}
                  />
                  <div className={styles.betaDiv}>
                    <span className={styles.beta}>beta</span>
                  </div>
                  {/*<span className={indexStyles.beta}>beta</span>*/}
                </div>
              </Link>
            </div>
            <div className={styles.navTabs}>
              <>
                <Link href={'/'}>
                  <a
                    className={`${styles.navItem} ${router.pathname === '/' ? styles.active : ''
                      }`}
                  >
                    HOME
                    <span className={styles.linkGradient} />
                  </a>
                </Link>
                <Link href={'/overview'}>
                  <a
                    className={`${styles.navItem} ${router.pathname !== '/' ? styles.active : ''
                      }`}
                  >
                    VAULTS
                    <span className={styles.linkGradient} />
                  </a>
                </Link>
              </>
            </div>

            <div className={styles.button}>
              {/* { wallet.publicKey && <CivicVerification />} */}

              <div className={styles.mobileConWallet}>
                <WalletMultiButton
                  startIcon={
                    <img
                      src="/svg/wallet.svg"
                      alt="wallet icon"
                      height={8}
                      width={8}
                    />
                  }
                  className={styles.launchApp}
                >
                  <span className="pc">
                    {wallet.connected
                      ? `${wallet.publicKey
                        ?.toString()
                        .slice(0, 6)} . . . ${wallet.publicKey
                          ?.toString()
                          .slice(-6)}`
                      : 'CONNECT WALLET'}
                  </span>
                  <div className={styles.graBtnBefore}></div>
                  <div className={styles.graBtnAfter}></div>
                </WalletMultiButton>
              </div>

              <div
                className={styles.dropdown}
                onClick={() => setShowDropDown(!showDropDown)}
              >
                {!showDropDown ? (
                  <img alt="open" src="/svg/menuopen.svg" />
                ) : (
                  <img alt="open" src="/svg/menuclose.svg" />
                )}
              </div>
            </div>
          </div>
          {showDropDown && (
            <div
              className={styles.dropdownContainer}
              onClick={() => setShowDropDown(!showDropDown)}
            >
              <div className={styles.dropdownMenu}>
                <Link href={'/'}>
                  <a>
                    <div
                      className={styles.dropdownItems}
                      onClick={() => setShowDropDown(!showDropDown)}
                    >
                      HOME
                    </div>
                  </a>
                </Link>
                <Link href={'/overview'}>
                  <a>
                    <div
                      className={styles.dropdownItems}
                      onClick={() => setShowDropDown(!showDropDown)}
                    >
                      VAULTS
                    </div>
                  </a>
                </Link>
              </div>
            </div>
          )}
        </section>
      ) : (
        <div className={styles.navRow + ' ' + styles.container}>
          <div className={styles.icon}>
            <Link href={'/'}>
              <div className={styles.logo}>
                <div className={styles.betaLogo}>
                  <LogoSVG />
                  <span className={styles.logoTxt}>merstab</span>
                  <div className={styles.betaDiv}>
                    <span className={styles.beta}>beta</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          <div className={styles.button}>
            <Link href={'/overview'}>
              <a>
                <div className={styles.launchAppContainer}>
                  <Button className={styles.launchApp}>
                    LAUNCH APP<div className={styles.graBtnBefore}></div>
                    <div className={styles.graBtnAfter}></div>
                  </Button>
                </div>
              </a>
            </Link>
          </div>
        </div>
      )}
    </>
  )
}

export default NavBar
