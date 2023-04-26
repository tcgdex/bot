import { PartialEmojiStructure } from '../Emoji'
import { default as Component, ComponentType, default as MessageComponent, MessageComponentStructure } from './Component'

export interface SelectOptionStructure {
	label: string
	value: string
	description?: string
	emoji?: PartialEmojiStructure
	default?: boolean
}

export interface SelectStructure extends MessageComponentStructure {
	options: Array<SelectOptionStructure>
	placeholder?: string
	min_value?: number
	max_values?: number
}

export default class Select extends Component {

	private _options: Array<SelectOptionStructure> = []
	private _placeholder?: string
	private _min_value?: number
	private _max_values?: number
	private _callback?: string

	public constructor() {
		super(ComponentType.Select)
	}

	public callback(): string
	public callback(callback: string): this
	public callback(callback?: string) {
		if (typeof callback === 'undefined') {
			return this._callback
		}
		this._callback = callback
		return this
	}

	public placeholder(): string
	public placeholder(placeholder: string): this
	public placeholder(placeholder?: string) {
		if (typeof placeholder === 'undefined') {
			return this._placeholder
		}
		this._placeholder = placeholder
		return this
	}

	public addOption(label: string, value: string, options?: {description?: string, emoji?: PartialEmojiStructure, default?: boolean}) {
		return this._options.push({label, value, ...options}) - 1
	}

	public removeOption(index: number) {
		this._options.splice(index, 1)
		return this
	}

	public options(): Array<SelectOptionStructure>
	public options(index: number): SelectOptionStructure
	public options(index: number, label: string, value: string, options?: {description?: string, emoji?: PartialEmojiStructure, default?: boolean}): this
	public options(index?: number, label?: string, value?: string, options?: {description?: string, emoji?: PartialEmojiStructure, default?: boolean}) {
		if (index && label && value) {
			this._options[index] = {label, value, ...options}
			return this
		} else if (!index) {
			return this._options
		}
		return this._options[index]
	}
}
