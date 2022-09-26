/* eslint-disable prettier/prettier */
import React from 'react'
import Image from 'next/image'
import { useMediaQuery } from 'react-responsive'
import styles from '../styles/Background.module.css'

const Background = () => {
  const isDesktop = useMediaQuery({
    query: '(min-width: 770px)',
  })
  return (
    <>
      {!isDesktop ? (
        <div className={styles.wavePosition}>
          <div className={styles.imageContainer}>
            <Image
              className={styles.landingImage}
              src="/wave.png"
              alt="waves"
              layout="fill"
            ></Image>
          </div>
        </div>
      ) : (
        <div className={styles.vimeoWrapper}>
          <iframe
            src="https://player.vimeo.com/video/671789697?background=1&autoplay=1&loop=1&byline=0&title=0"
            frameBorder="0"
            allow="autoplay; fullscreen"
            allowFullScreen
          ></iframe>
        </div>
      )}
    </>
  )
}

export default Background
