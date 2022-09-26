Example of CLI usage

the /vaults folder should have an example of the vaults in existance

1. Create vault
   `ts-node merstab-cli.ts add-vault --name <name> --limit <amount> -k ~/.config/solana/id.json`

2. Stake
   `ts-node merstab-cli.ts stake --vault Grs6TaBkFDY6EdTF3kVXcT5PVpPWCjBDSZHbYPHLAHxG --amount 100 --deposit-mint BNH9xMad6Gh3qxGPbkwKE221gepfuUPMGs9XLGpVeBmv -k ~/.config/solana/id.json -l DEBUG`

3. Unstake
   `ts-node merstab-cli.ts unstake --vault Grs6TaBkFDY6EdTF3kVXcT5PVpPWCjBDSZHbYPHLAHxG --amount 100 --deposit-mint BNH9xMad6Gh3qxGPbkwKE221gepfuUPMGs9XLGpVeBmv -k ~/.config/solana/id.json -l DEBUG`
