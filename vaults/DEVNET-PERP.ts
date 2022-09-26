import { PublicKey } from '@solana/web3.js'

// NOTE THIS EXAMPLE'S LIMIT IS TOO LOW TO WORK
export const depositMint = new PublicKey(
  process.env.MANGO_SOLPERP_QUOTE_MINT ?? ''
)
export const depositMintDecimals = 6
export const mTokenMint = new PublicKey(
  process.env.MANGO_SOLPERP_TOKEN_MINT ?? ''
)
export const vault = new PublicKey(process.env.MANGO_SOLPERP_VAULT ?? '')

export class DevnetPerp {
  static get depositMint() {
    return depositMint
  }

  static get depositMintDecimals() {
    return depositMintDecimals
  }

  static get mTokenMint() {
    return mTokenMint
  }

  static get vault() {
    return vault
  }

  static get vaultName() {
    return 'TBD'
    // return vaultName;
  }
}
