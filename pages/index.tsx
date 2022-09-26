import type { NextPage } from 'next'
import HomeSection from '../components/Home/HomeSection'
import MissionSection from '../components/Home/MissionSection'
import ProductSection from '../components/Home/ProductSection'
import TeamSection from '../components/Home/TeamSection'

const Home: NextPage = () => {
  return (
    <>
      <HomeSection />
      <MissionSection />
      <ProductSection />
      <TeamSection />
    </>
  )
}

export default Home
