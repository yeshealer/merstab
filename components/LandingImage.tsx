import React from 'react'
import Image from 'next/image'
import styles from '../styles/LandingImage.module.css'

const LandingImage = () => {
  return (
    <div>
      <Image
        className={styles.landingImage}
        src="/wave.png"
        alt="waves"
        layout="fill"
      ></Image>
    </div>
  )
}

export default LandingImage
