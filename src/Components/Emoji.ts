import { Snowflake } from 'discord.js'

export interface PartialEmojiStructure {
	id: Snowflake
	name?: string
	animated?: boolean
}

export default class Emoji {

	public constructor(
		private id: string,
		private name?: string
	) {}

	public static toDiscordString(id: string, name: string) {
		return `<:${name.toLowerCase()}:${id}>`
	}

	public getImage(ext?: 'png' | 'jpg' | 'webp' | 'gif') {
		return `https://cdn.discordapp.com/emojis/${this.id}.${ext}`
	}

	public toDiscordString(): string {
		return Emoji.toDiscordString(this.id, this.name ?? '')
	}
}
