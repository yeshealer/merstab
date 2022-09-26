/** @type {import('next').NextConfig} */

module.exports = {
  // reactStrictMode: true,
  env: {
    ACCESS_KEY: process.env.ACCESS_KEY,
    SECRET_KEY: process.env.SECRET_KEY,
    MANGO_SOLPERP_DYNAMODB_TABLE: process.env.MANGO_SOLPERP_DYNAMODB_TABLE,
    MANGO_SOLPERP_VAULT: process.env.MANGO_SOLPERP_VAULT,
    MANGO_SOLPERP_QUOTE_MINT: process.env.MANGO_SOLPERP_QUOTE_MINT,
    MANGO_SOLPERP_TOKEN_MINT: process.env.MANGO_SOLPERP_TOKEN_MINT,
    SOLANA_CLUSTER: process.env.SOLANA_CLUSTER,
    REGION: process.env.REGION,
    MANGO_SOLPERP_MANGO_MARKET_ACCOUNT:
      process.env.MANGO_SOLPERP_MANGO_MARKET_ACCOUNT,
  },
  swcMinify: false,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false
    }
    config.experiments = {
      asyncWebAssembly: true,
    }
    return config
  },
  // async redirects() {
  //     return [{
  //         source: '/',
  //         destination: '/vault',
  //         permanent: false
  //     }]
  // }
}
