import { MessageOptions } from 'discord.js'
import Button from './Button'
import Embed from './Embed'
import Select from './Select'

/**
 * Class to get/set a message
 */
export default class Message {
	
	private _text: string
	private embeds: Array<Embed> = []
	private components: Array<Array<Button | Select>> = []

	public constructor(text?: string) {
		this._text = text ?? ' '
	}

	public text(): string
	public text(text: string): this
	public text(text?: string) {
		if (text) {
			this._text = text
			return this
		}
		return this._text
	}

	public row(action: 'NEW' | number, ...buttons: Array<Button | Select>) {
		this.components[action === 'NEW' ? this.components.length : action] = buttons
		return this
	}

	public embed(): Array<Embed>
	public embed(embed: Embed, index?: number): this
	public embed(embed?: Embed, index?: number) {
		if (!embed) {
			return this.embeds
		}
		if (index) {
			this.embeds[index] = embed
		} else {
			this.embeds.push(embed)
		}
		return this
	}

	public toDiscordJS(): MessageOptions {
		return {
			content: this.text(),
			embeds: this.embed().map((e) => e.toDiscordJS()),
			components: this.components.map((r) => r.map((b) => b.toDiscordJS()))
		}
	}
}
