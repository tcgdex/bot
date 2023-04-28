import { Snowflake } from 'discord.js'

export interface PartialEmojiStructure {
	id: Snowflake
	name?: string
	animated?: boolean
}

export default class Emoji {

	public constructor(
		public readonly id: string,
		public readonly name?: string
	) {}

	public static toDiscordString(id: string, name: string) {
		return `<:${name.toLowerCase()}:${id}>`
	}

	/**
	 * Find in the [text] the list of emojis that are in
	 * @param text the text to search
	 * @returns the list of emojis in the [text]
	 */
	public static parseEmojis(text: string): Array<Emoji> {
		const regex = /<emoji name="(\w+)" id="(\w+)" \/>/g
		let match = null
		const matches: Array<Emoji> = []
		do {
			match = regex.exec(text)
			if (match !== null) {
				matches.push(
					new Emoji(match[2], match[1])
				)
			}
		} while (match !== null)
		return matches
	}

	public static formatText(text: string, modifier: (emoji: Emoji) => string): string {
		const emojis = Emoji.parseEmojis(text)
		for (const emoji of emojis) {
			text = emoji.replaceInText(text, modifier(emoji))
		}
		return text
	}

	public replaceInText(text: string, replacement: string): string {
		const toFind = this.toString()
		const regex = new RegExp(toFind, 'g')
		return text.replace(regex, replacement)
	}

	public getImage(ext: 'png' | 'jpg' | 'webp' | 'gif' = 'png') {
		return `https://cdn.discordapp.com/emojis/${this.id}.${ext}`
	}

	public toDiscordString(): string {
		return Emoji.toDiscordString(this.id, this.name ?? '')
	}

	public toString(): string {
		return `<emoji name="${this.name}" id="${this.id}" />`
	}
}
