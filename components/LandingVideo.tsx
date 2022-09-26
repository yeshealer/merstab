import React from 'react'
import styles from '../styles/LandingVideo.module.css'

const LandingVideo = () => {
  return (
    <div className={styles.vimeoWrapper}>
      <iframe
        src="https://player.vimeo.com/video/671789697?background=1&autoplay=1&loop=1&byline=0&title=0"
        frameBorder="0"
        allowFullScreen
      ></iframe>
    </div>
  )
}

export default LandingVideo
