import { useGateway, GatewayStatus } from '@civic/solana-gateway-react'
import { Button } from 'antd'
import React from 'react'
import styles from '../styles/CivicVerification.module.css'
import Image from 'next/image'

const CivicVerification = () => {
  const { gatewayStatus, requestGatewayToken } = useGateway()
  return (
    <Button className={styles.civicButton} onClick={requestGatewayToken}>
      <Image src={'/svg/civicIcon.svg'} height={32} width={32}></Image>
      {GatewayStatus[gatewayStatus]}
    </Button>
  )
}

export default CivicVerification
