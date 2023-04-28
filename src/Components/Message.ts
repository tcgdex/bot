import ActionRow from './Components/ActionRow'
import Button from './Components/Button'
import Select from './Components/Select'
import Embed from './Embed'

export type MessageComponents = Button | Select

/**
 * Class to get/set a message
 */
export default class Message {

	private _text: string
	private embeds: Array<Embed> = []
	private components: Array<ActionRow> = []

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

	public row(): Array<ActionRow>
	public row(index: number): ActionRow
	public row(index?: number, ar?: ActionRow) {
		if (!index) {
			return this.components
		}
		if (!ar) {
			return this.components[index]
		}
		if (!this.components[index]) {
			throw new Error(`Nothing was added for this index (${index})`)
		}
		this.components[index] = ar
		return this
	}

	public addRow(...ar: Array<ActionRow>): this {
		// TODO: add this to the discord code
		// if (this.components.length > 5) {
		// 	throw new Error('You can have more than 5 Action Rows per message')
		// }
		this.components.push(...ar)
		return this
	}

	public removeRow(index: number) {
		this.components.splice(index, 1)
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
}
