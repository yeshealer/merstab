import styles from './index.module.css'

interface ITeam {
  photo: string
  name: string
  job: string
  experience: string
  spExperience?: string
}

const TeamSection = () => {
  const teamMembers: ITeam[] = [
    {
      photo: './magic/team/team01.png',
      name: 'Heisenburger',
      job: 'Head Quant',
      experience: '15 years at Wall Street',
    },
    {
      photo: './magic/team/team02.png',
      name: 'TheWuh',
      job: 'Web3 Developer',
      experience: 'Multiple DeFi projects',
      spExperience: 'Hustling',
    },
    {
      photo: './magic/team/team03.png',
      name: 'Koopman',
      job: 'Operations & Marketing',
      experience: 'DeepTech | Crypto OG',
    },
    {
      photo: './magic/team/team04.png',
      name: 'Panoply',
      job: 'Infrastructure',
      experience: 'TradFi DevOps',
    },
    {
      photo: './magic/team/team05.png',
      name: 'Raffaelo',
      job: 'AlgoOps',
      experience: 'Management Consulting Data Science',
      spExperience: 'Mgt Consulting | Data Science',
    },
  ]
  return (
    <section id="team" className={styles.teamSection}>
      <div className="container">
        <h1 className={styles.teamHeader}>THE TEAM</h1>
        <div className={styles.teamMembers}>
          {teamMembers.map((item, idx) => (
            <div className={styles.team} key={idx}>
              <div className={styles.teamImg}>
                <div className={styles.teamPhoto}>
                  <img alt={item.name} src={item.photo} />
                </div>
              </div>
              <div className={styles.teamTxtInfo}>
                <h2 className={styles.teamName}>{item.name}</h2>
                <p className={styles.teamJob}>{item.job}</p>
                <p className={styles.teamExp}>
                  {item.spExperience ? (
                    <>
                      <span className="pc">{item.experience}</span>
                      <span className="sp">{item.spExperience}</span>
                    </>
                  ) : (
                    <span>{item.experience}</span>
                  )}
                </p>
              </div>
              <div className={styles.teamGra}></div>
            </div>
          ))}
        </div>
        <div className={styles.teamSectionText}>
          <div className={styles.teamText}>
            At Merstab, we are building decentralized market infrastructure that
            helps Derivatives DEXs grow.
            <p className="onlySp" /> Our team of quants, DevOps specialists,
            Web3 developers, and market analysts came together and built an
            infrastructure to provide better and more stable liquidity to DDEXs
            and help the industry achieve wider market adoption.
          </div>
          <a href="mailto:contactus@merstab.com">
            <button className={styles.contactUsButton}>CONTACT US</button>
          </a>
        </div>
      </div>
      <div className={styles.teamMdBg}></div>
      <div className={styles.teamEndBg}></div>
    </section>
  )
}

export default TeamSection
