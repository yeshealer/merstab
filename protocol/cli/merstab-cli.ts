import { Keypair } from '@solana/web3.js'
import { program } from 'commander'
import params from './cli-params.json'
import fs from 'fs'
import log from 'loglevel'
import { addVault } from './commands/add-vault'
import { stake } from './commands/stake'
import { unstake } from './commands/unstake'

program.version('0.0.1')

function programCommand(name: string) {
  return program
    .command(name)
    .option(
      '-e, --env <string>',
      'Solana cluster env name',
      params.env //mainnet-beta, testnet, devnet
    )
    .option(
      '-k, --keypair <path>',
      `Solana wallet location`,
      params.keypairPath
    )
    .option('-l, --log-level <string>', 'log level', setLogLevel)
}

// vault creation
programCommand('add-vault')
  .requiredOption('--name <string>', 'name of the vault')
  .requiredOption('--limit <string>', 'limit of the vault')
  .action(async (directory, cmd) => {
    const { keypair, env, name, limit, depositMint } = cmd.opts()
    const wallet = loadWalletKey(keypair)
    await addVault(env, wallet, name, limit, depositMint)
  })

programCommand('stake')
  .requiredOption('--amount <string>', 'amount of tokens to stake')
  .requiredOption('--vault <string>', 'public key of the vault')
  .requiredOption('--deposit-mint <string>', 'coin that your are staking')
  .action(async (directory, cmd) => {
    const { keypair, env, amount, vault, depositMint } = cmd.opts()
    const wallet = loadWalletKey(keypair)
    const txid = await stake(env, wallet, amount, vault, depositMint)
    console.log(`Stake txid: ${txid}`)
  })

programCommand('unstake')
  .requiredOption('--amount <string>', 'amount of tokens to stake')
  .requiredOption('--vault <string>', 'public key of the vault')
  .requiredOption('--deposit-mint <string>', 'coin that your are staking')
  .action(async (directory, cmd) => {
    const { keypair, env, amount, vault, depositMint } = cmd.opts()
    const wallet = loadWalletKey(keypair)
    const txid = await unstake(env, wallet, amount, vault, depositMint)
    console.log(`Unstake txid: ${txid}`)
  })

export function loadWalletKey(keypair: string): Keypair {
  if (!keypair || keypair == '') {
    throw new Error('Keypair is required!')
  }
  const loaded = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(keypair).toString()))
  )
  return loaded
}

program
  .configureOutput({
    // Visibly override write routines as example!
    writeOut: (str) => process.stdout.write(`[OUT] ${str}`),
    writeErr: (str) => process.stdout.write(`[ERR] ${str}`),
    // Highlight errors in color.
    outputError: (str, write) => write(errorColor(str)),
  })
  .parse(process.argv)

function errorColor(str: any) {
  // Add ANSI escape codes to display text in red.
  return `\x1b[31m${str}\x1b[0m`
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function setLogLevel(value, prev) {
  if (value == null) {
    return
  }
  log.info('setting the log value to: ' + value)
  log.setLevel(value)
}
