import { PartialEmojiStructure } from '../Emoji'
import { default as Component, ComponentType } from './Component'

export interface SelectOptionStructure {
	label: string
	value: string
	description?: string
	emoji?: PartialEmojiStructure
	default?: boolean
}


export default class Select extends Component {

	private _options: Array<SelectOptionStructure> = []
	private _placeholder?: string
	private _minValue?: number
	private _maxValue?: number
	private _callback?: string

	public constructor(callback?: string) {
		super(ComponentType.Select)
		if (callback) {
			this.callback(callback)
		}
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

	public minValue(): number
	public minValue(minValue: number): this
	public minValue(minValue?: number) {
		if (typeof minValue === 'undefined') {
			return this._minValue
		}
		this._minValue = minValue
		return this
	}

	public maxValue(): number
	public maxValue(maxValue: number): this
	public maxValue(maxValue?: number) {
		if (typeof maxValue === 'undefined') {
			return this._maxValue
		}
		this._maxValue = maxValue
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
