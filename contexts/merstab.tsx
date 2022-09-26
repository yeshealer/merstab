import { Connection } from '@solana/web3.js'
import React, { FC, useContext, useEffect, useState } from 'react'
import * as anchor from '@project-serum/anchor'
import { useWallet } from '@solana/wallet-adapter-react'
import { MerstabClient, Wallet } from '../protocol/merstab'

export interface MerstabContext {
  provider: anchor.AnchorProvider | null
  client: MerstabClient | null
}

const MerstabContext = React.createContext<MerstabContext>(null!)

export const useMerstab = () => {
  return useContext(MerstabContext)
}

export interface MerstabProviderProps {
  children?: any
  env: string
}

export const MerstabProvider: FC<MerstabProviderProps> = ({
  children,
  env,
}) => {
  // console.log("children:", children);
  const [provider, setProvider] = useState<anchor.AnchorProvider | null>(null)
  const [client, setClient] = useState<MerstabClient | null>(null)

  const wallet = useWallet()

  useEffect(() => {
    if (!wallet) return
    setupMerstab(env)
  }, [wallet])

  const setupMerstab = async (env: string) => {
    console.log('cluster is: ', process.env.SOLANA_CLUSTER)
    const connection =
      process.env.SOLANA_CLUSTER === 'devnet'
        ? new Connection(
            'https://merstab-develope-537a.devnet.rpcpool.com/807c0293-a98b-4654-9eee-98396224ac39'
          )
        : new Connection(
            'https://merstab-main-1336.mainnet.rpcpool.com/4e83182e-8757-4a84-81e6-5f0c153bd3a0'
          )
    const anchorProvider = new anchor.AnchorProvider(
      connection,
      wallet as Wallet,
      { skipPreflight: false }
    )
    const merstab = await MerstabClient.connect(anchorProvider, env)

    setProvider(anchorProvider)
    setClient(merstab)
  }

  return (
    <MerstabContext.Provider
      value={{
        provider,
        client,
      }}
    >
      {children}
    </MerstabContext.Provider>
  )
}
