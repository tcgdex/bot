import { Snowflake } from 'discord.js'

export interface PartialEmojiStructure {
	id: Snowflake
	name?: string
	animated?: boolean
}

export interface EmojiStructure extends PartialEmojiStructure {
	roles?: Array<Snowflake>
	require_colons?: boolean
	managed?: boolean
	available?: boolean
}

export default class Emoji {

	public definition: EmojiStructure

	public constructor(id: Snowflake) {
		this.definition = {
			id
		}
	}

	public getImage(ext?: 'png' | 'jpg' | 'webp' | 'gif') {
		return `https://cdn.discordapp.com/emojis/${this.definition.id}.${ext}`
	}
}
