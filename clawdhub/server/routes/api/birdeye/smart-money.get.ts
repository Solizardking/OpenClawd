import { defineEventHandler, getQuery, createError } from 'h3'
import { getBirdeyeSmartMoneyTokens } from '../../../lib/birdeye'

/**
 * GET /api/birdeye/smart-money?interval=1d&trader_style=all&limit=20
 * Returns tokens currently favored by Birdeye smart-money cohorts.
 */
export default defineEventHandler(async (event) => {
  try {
    const { interval, trader_style, sort_by, sort_type, offset, limit } = getQuery(event)
    const result = await getBirdeyeSmartMoneyTokens({
      interval: interval ? String(interval) : '1d',
      traderStyle: trader_style ? String(trader_style) : 'all',
      sortBy: sort_by ? String(sort_by) : 'smart_traders_no',
      sortType: sort_type ? String(sort_type) : 'desc',
      offset: offset ? Number(offset) : 0,
      limit: limit ? Math.min(Number(limit), 20) : 20,
    })
    return result
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) throw error
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to fetch Birdeye smart money',
    })
  }
})
