import Image from 'next/image'
import styles from '../styles/AbstractWave.module.css'

const AbstractWave = () => {
  return (
    <div className={styles.imageContainer}>
      <Image src="/abstract_wave_1.png" alt="waves" layout="fill"></Image>
    </div>
  )
}

export default AbstractWave
