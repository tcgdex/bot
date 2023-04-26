import { config } from 'dotenv'

// Fetch env
config()

import Bot from './Bot'
(async () => {
	const bot = new Bot()
	await bot.init()
})()
