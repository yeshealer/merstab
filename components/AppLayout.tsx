/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useRef } from 'react'
import { Layout } from 'antd'
import NavBar from './NavBar'
import AppFooter from './AppFooter'
import styles from '../styles/AppLayout.module.css'
import Head from 'next/head'
import { useRouter } from 'next/router'

const { Header } = Layout

const AppLayout = ({ children = undefined as any }) => {
  const scrollBody = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const handleScroll = useCallback(() => {
    const homeSection = document.getElementById('home')
    if (homeSection !== null) {
      const missionSection = document.getElementById('mission')
      const productSection = document.getElementById('product')
      const scrollT = scrollBody.current ? scrollBody.current.scrollTop : 0
      if (scrollT <= homeSection.scrollHeight) {
        homeSection.style.opacity = `${1 - scrollT / homeSection.scrollHeight}`
      } else if (
        missionSection !== null &&
        scrollT <= missionSection.scrollHeight + homeSection.scrollHeight
      ) {
        missionSection.style.opacity = `${1 - (scrollT - homeSection.scrollHeight) / missionSection.scrollHeight
          }`
      } else if (productSection !== null) {
        productSection.style.opacity = `${1 -
          (scrollT - homeSection.scrollHeight - missionSection!.scrollHeight) /
          productSection.scrollHeight
          }`
      }
    }
  }, [])

  useEffect(() => {
    scrollBody.current?.addEventListener('scroll', handleScroll)
  }, [])

  return (
    <Layout className={styles.root}>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Rubik:wght@300&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div
        ref={scrollBody}
        className={
          router.pathname === '/'
            ? `${styles.content} ${styles.main}`
            : `${styles.content} ${styles.main} ${styles.noHomeMain}`
        }
        style={{
          flexGrow: 1,
          overflowX: 'hidden',
          alignItems: 'center',
          flexDirection: 'column',
          height: '100vh',
        }}
      >
        <Header
          className={
            router.pathname === '/'
              ? `${styles.header}`
              : `${styles.header} ${styles.noHomeHeader}`
          }
          style={{ flexGrow: 0, zIndex: 3 }}
        >
          <NavBar />
          <div className={styles.headerBg}></div>
        </Header>
        {children}
        <footer
          style={{
            flexGrow: 0,
            zIndex: 2,
          }}
        >
          <AppFooter></AppFooter>
        </footer>
      </div>
    </Layout>
  )
}

export default AppLayout
