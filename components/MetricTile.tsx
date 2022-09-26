import React from 'react'
import styles from '../styles/MetricTile.module.css'

export interface MetricTileProps {
  metric: string
  metricTitle: string
}
const MetricTile = (props: MetricTileProps) => {
  return (
    <div className={styles.tile}>
      <div className={styles.metric}>{props.metric}</div>
      <div className={styles.metricTile}>{props.metricTitle}</div>
    </div>
  )
}

export default MetricTile
