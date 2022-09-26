import React, { FC, useState } from 'react'
import { Row } from 'antd'

import styles from '../styles/welcome.module.css'
import indexStyles from '../styles/index.module.css'
import { setStorage } from '../services/storage.service'


const WelcomeModal: FC = () => {

    const [show, setShow] = useState(true)
    //const { changeCookieAllow } = useContext(StoreContext)

    return (
        <div className={`${show ? 'block' : 'hidden'}`}>
            <div className={styles.container}>
                <Row className={styles.modalBody}>
                    <div className={indexStyles.betaLogo}>
                        <img
                            src="/magic/logo.png"
                            alt="logo"
                            width={88}
                            height={40}
                        />
                        <div className={indexStyles.betaDiv}>
                            <span className={indexStyles.beta}>beta</span>
                        </div>
                    </div>
                    <h1 className={styles.header}>Welcome to <span className={styles.headerGradient}>Merstab</span></h1>
                    <p className={styles.content}>We are currently in beta. You can explore our website. If you want to test our beta vault, you have to whitelist your wallet.
                    </p>
                    <p className={styles.content}>Get in touch with our team on discord to whitelist your wallet for testing.
                    </p>
                    <button className={styles.gradientBorder} onClick={() => { setStorage('start', true); setShow(false); window.open('https://discord.com/invite/Nhn8YbsgaE', '_blank'); }}> <img
                        src="/svg/discord.svg"
                        alt="logo"
                        width={30}
                        height={23}
                    /><p className='ml-12'>Join discord</p></button>
                    <button className={styles.gradientBtn} onClick={() => { setStorage('start', true); setShow(false) }}>EXPLORE</button>
                </Row>
            </div>
        </div>
    )
}

export default WelcomeModal