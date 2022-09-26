import { useMerstab } from '../contexts/merstab'
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'
import { PublicKey } from '@solana/web3.js'
import {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'

export async function checkWalletWhitelist(walletPk: string): Promise<boolean> {
  const client = new SSMClient({
    region: process.env.REGION,
    credentials: {
      accessKeyId: process.env.ACCESS_KEY ?? '',
      secretAccessKey: process.env.SECRET_KEY ?? '',
    },
  })
  const input = {
    Name: 'wallet_whitelist',
  }
  const command = new GetParameterCommand(input)
  const response = await client.send(command)
  return response.Parameter.Value.split(',').includes(walletPk)
}

export async function getDayTransactions(
  walletPk: string,
  op: string
): Promise<number> {
  const dbclient = new DynamoDBClient({
    region: process.env.REGION,
    credentials: {
      accessKeyId: process.env.ACCESS_KEY ?? '',
      secretAccessKey: process.env.SECRET_KEY ?? '',
    },
  })

  const prevDate = new Date()
  prevDate.setHours(0, 0, 0, 0)

  const futDate = new Date()
  futDate.setHours(24, 0, 0, 0)

  const params = {
    ExpressionAttributeNames: {
      '#TS': 'timestamp',
    },
    ExpressionAttributeValues: {
      ':walletPk': {
        S: walletPk,
      },
      ':prevDate': {
        N: Date.parse(prevDate.toISOString()).toString(),
      },
      ':futDate': {
        N: Date.parse(futDate.toISOString()).toString(),
      },
    },
    KeyConditionExpression:
      'walletPk = :walletPk AND (#TS BETWEEN :prevDate AND :futDate)',
    TableName: process.env.MANGO_SOLPERP_DYNAMODB_TABLE,
  }
  try {
    const results = await dbclient.send(new QueryCommand(params))
    let totalAmount = 0
    results.Items.forEach((item) => {
      if (op == item.operation.S) totalAmount += Number(item.amount.N)
    })
    return totalAmount
  } catch (err) {
    console.error(err)
    throw new Error('error reading from DynamoDB')
  }
}

export async function writeVaultOp(
  walletPk: string,
  op: string,
  amount: number,
  vaultPk: string
): Promise<void> {
  const dbclient = new DynamoDBClient({
    region: process.env.REGION,
    credentials: {
      accessKeyId: process.env.ACCESS_KEY ?? '',
      secretAccessKey: process.env.SECRET_KEY ?? '',
    },
  })
  const params = {
    Item: {
      walletPk: {
        S: walletPk,
      },
      timestamp: {
        N: Date.parse(new Date().toISOString()).toString(),
      },
      amount: {
        N: amount.toString(),
      },
      vaultPk: {
        S: vaultPk,
      },
      operation: {
        S: op,
      },
    },
    ReturnConsumedCapacity: 'TOTAL',
    TableName: process.env.MANGO_SOLPERP_DYNAMODB_TABLE,
  }
  try {
    await dbclient.send(new PutItemCommand(params))
  } catch (err) {
    console.error(err)
    throw new Error('error writing to DynamoDB')
  }
}

export async function getDetailedAccountPerformance(
  account: string,
  startDate: string
) {
  const response = await fetch(
    `https://mango-transaction-log.herokuapp.com/v3/stats/account-performance-detailed?mango-account=${account}&start-date=${startDate}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
  if (response.ok) {
    return response.json()
  } else {
    throw new Error(
      `Mango API failed with code: ${response.status} ${response.statusText}`
    )
  }
}

export async function getMangoAccountEquity(
  account: string,
  startDate: string
): Promise<number> {
  try {
    const data = await getDetailedAccountPerformance(account, startDate)
    const today = new Date()
    const thisYear = today.getUTCFullYear()
    const todayDayOfMonth = addLeadingZero(today.getUTCDate())
    const todayMonth = addLeadingZero(today.getUTCMonth() + 1)

    let todayAcctEquity = 0
    for (const tstring in data) {
      if (
        tstring === `${thisYear}-${todayMonth}-${todayDayOfMonth}T00:00:00.000Z`
      ) {
        todayAcctEquity = data[tstring].account_equity
      }
    }

    return todayAcctEquity
  } catch (e) {
    console.log('trouble getting account equity')
    console.log('error:', e)
    return 0
  }
}

export function addLeadingZero(number: number): string {
  return number.toString().length == 1 ? `0${number}` : number.toString()
}

export function toDecimalPlaces(str: string, val: number) {
  str = str.toString()
  str = str.slice(0, str.indexOf('.') + val + 1)
  return Number(str)
}

export function getYesterdayDateString(): string {
  const hours_in_day = 24
  const minutes_in_hour = 60
  const seconds_in_minute = 60
  const milliseconds_in_second = 1000
  const yesterday = new Date(
    new Date().getTime() -
      hours_in_day *
        minutes_in_hour *
        seconds_in_minute *
        milliseconds_in_second
  )
  const yesterdayDateString = yesterday.toISOString().split('T')[0]
  return yesterdayDateString
}
