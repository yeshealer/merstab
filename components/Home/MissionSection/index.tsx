import styles from './index.module.css'

const MissionSection = () => {
  return (
    <section id="mission" className={styles.missionSection}>
      <div className="container">
        <div className={styles.missionWrapper}>
          <h2 className={styles.ourMissionLine}>
            <span className={styles.lineSpan}>THE MISSION</span>
          </h2>
        </div>
        <div className={styles.flexRow}>
          <div className={styles.missionFlexColumn}>
            <div className={styles.sectionHeader}>
              Helping Derivatives DEXs Grow Through Liquidity Provision
            </div>
            <div className={styles.missionText}>
              We believe DeFi will become the underlying core infrastructure of
              the global financial market.
              <br />
              Our mission is to help the industry achieve wider market adoption
              through liquidity provision to Derivatives DEXs.
            </div>
            <a
              // href="https://devpost.com/software/merstab"
              href="https://drive.google.com/file/d/1DtUIcEIhXGLYJHOk76Ep_hTnxleLuHci"
              target="_blank"
              rel="noreferrer"
            >
              <button className={styles.learnMore}>LEARN MORE</button>
            </a>
          </div>
        </div>
        <h2 className={styles.missionBottomLine}></h2>
      </div>
    </section>
  )
}

export default MissionSection
