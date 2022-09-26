import { Col, Row } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import styles from '../styles/VaultPerformanceInfo.module.css'
import MetricTile from './MetricTile'
import { useMerstab } from '../contexts/merstab'
import { PublicKey } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'
import { toDecimalPlaces } from '../helpers'

export interface VaultMetric {
  key: number
  metric: string
  metricTitle: string
}
export interface VaultPerformanceInfoProps {
  mTokenMint: PublicKey
  vault: PublicKey
}

const VaultPerformanceInfo = (props: VaultPerformanceInfoProps) => {
  const { client } = useMerstab()
  const wallet = useWallet()

  // const [pnl, setPnl] = useState(0);
  const [pnlPercent, setPnlPercent] = useState(0)
  const [apy, setApy] = useState(92.1)

  // fetch data when available
  const fetchPnlInfo = useCallback(async () => {
    if (!client || !wallet || !wallet.publicKey) {
      console.log(`One of the following are undefined: ${client}, ${wallet}`)
      return
    }

    try {
      const { pnlPercentage } = await client.getPnl(
        wallet.publicKey,
        props.vault,
        props.mTokenMint
      )
      if (pnlPercentage) {
        // console.log("pnl:", pnlInfo.pnl);
        // setPnl(pnlInfo.pnl);

        console.log('pnl percentage:', pnlPercentage)
        setPnlPercent(pnlPercentage)
      } else {
        console.log('No pnl info')
      }
    } catch (err) {
      console.log(err)
    }
  }, [client, wallet, props.vault, props.mTokenMint])

  const fetchApy = async () => {
    if (!client || !wallet || !wallet.publicKey) {
      console.log(`One of the following are undefined: ${client}, ${wallet}`)
      return
    }

    const apy = await client.getApy(props.vault)
    setApy(apy)
  }

  useEffect(() => {
    fetchPnlInfo()
    fetchApy()
  }, [/*client, wallet, */ fetchPnlInfo, fetchApy])

  const data: VaultMetric[] = [
    { key: 0, metric: 'N/A', metricTitle: 'Mth. Avg Ret.' },
    { key: 1, metric: 'N/A', metricTitle: 'Market returns' },
    { key: 2, metric: 'N/A', metricTitle: 'Loss MM' },
    { key: 3, metric: 'N/A', metricTitle: 'MaxDD' },
    { key: 4, metric: 'N/A', metricTitle: 'Win (%)' },
    { key: 5, metric: 'N/A', metricTitle: 'Total Trades' },
    { key: 6, metric: 'N/A', metricTitle: 'Sharpe Ratio' },
  ]

  const data2: VaultMetric[] = [
    { key: 7, metric: 'N/A', metricTitle: 'Profit Factor' },
    { key: 8, metric: 'N/A', metricTitle: 'Avg Win' },
    { key: 9, metric: 'N/A', metricTitle: 'Avg Loss' },
    { key: 10, metric: 'N/A', metricTitle: 'Long Returns' },
    {
      key: 11,
      metric: `${toDecimalPlaces(pnlPercent.toString(), 2)}%`,
      metricTitle: 'Short Returns',
    },
    { key: 12, metric: 'N/A', metricTitle: 'Avg Exposure' },
  ]

  // fetch
  // const apy = "22.1%";
  return (
    <Row className={styles.vaultPerformanceInfo}>
      <Col className={styles.performance} span={12}>
        <div className={styles.vaultPerformance}>VAULT PERFORMACE</div>
        <div className={styles.vaultRateCon}>
          <div style={{ marginRight: 4, fontSize: 60 }}>
            {!apy ? '--' : `${toDecimalPlaces(apy.toString(), 2)}`}%
          </div>
          <div
            style={{ display: 'flex', flexDirection: 'column', paddingLeft: 8 }}
          >
            <div style={{ fontSize: 16 }}>Projected</div>
            <div style={{ fontSize: 16 }}>DPY</div>
          </div>
        </div>
        <div className={styles.performanceBg}></div>
      </Col>
      {/* <Col className={styles.performance} span={12}>
        <div className={styles.vaultPerformance}>PnL</div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ marginRight: 4, fontSize: 60 }}>
            {Number(pnl) > 0 ? `+${pnl}` : `${pnl}`}
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", paddingLeft: 8 }}
          >
            <div style={{ fontSize: 16 }}>USDC</div>
          </div>
        </div>
      </Col> */}

      {/* Stats component */}
      <Col className={styles.metrics} span={12}>
        <div className={styles.metricRow}>
          {data.map((vaultMetric: VaultMetric) => {
            return (
              <div key={vaultMetric.key} style={{ flexGrow: 1 }}>
                <MetricTile {...vaultMetric}> </MetricTile>
              </div>
            )
          })}
        </div>
        <div className={styles.metricRow}>
          {data2.map((vaultMetric: VaultMetric) => {
            return (
              <div key={vaultMetric.key} style={{ flexGrow: 1 }}>
                <MetricTile {...vaultMetric}> </MetricTile>
              </div>
            )
          })}
        </div>
      </Col>
    </Row>
  )
}

export default VaultPerformanceInfo
