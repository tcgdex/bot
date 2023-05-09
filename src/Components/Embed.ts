interface EmbedField {
	name: string
	value: string
	inline?: boolean
}

interface EmbedProvider {
	name?: string
	url?: string
}

interface EmbedAuthor {
	name: string
	url?: string
	icon_url?: string
	proxy_icon_url?: string
}

interface EmbedImage {
	url: string
	proxy_url?: string
	height?: number
	width?: number
}

interface EmbedFooter {
	text: string
	icon_url?: string
	proxy_icon_url?: string
}

/**
 * Global Embed object
*/
export default class Embed {

	private _title?: string
	private _description?: string
	private _url?: string
	private _timestamp?: Date
	/**
	 * if it's a string define the color as a Hexadecimal value
	 */
	private _color?: number
	private _footer?: EmbedFooter
	private _image?: EmbedImage
	private _thumbnail?: EmbedImage
	private _video?: EmbedImage
	private _provider?: EmbedProvider
	private _author?: EmbedAuthor
	private _fields: Array<EmbedField> = []

	public constructor(title?: string, description?: string) {
		if (title) {
			this._title = title ?? ' '
		}
		if (description) {
			this._description = description ?? ' '
		}
	}

	public title(): string
	public title(value: string): this
	public title(value?: string) {
		if (typeof value === 'undefined') {
			return this._title
		}
		// TODO: add limit in Discord.ts
		// if (value.length > 256) {
		// 	throw new Error(`embed title can't be larger than 256 characters (${value})`)
		// }
		this._title = value
		return this
	}

	public description(): string
	public description(value: string): this
	public description(value?: string) {
		if (typeof value === 'undefined') {
			return this._description
		}
		// TODO: add limit in Discord.ts
		// if (value.length > 4096) {
		// 	throw new Error(`embed title can't be larger than 4096 characters (${value})`)
		// }
		this._description = value
		return this
	}

	public url(): string
	public url(value: string): this
	public url(value?: string) {
		if (value) {
			this._url = value
			return this
		}
		return this._url
	}

	public timestamp(): Date
	public timestamp(value: Date): this
	public timestamp(value?: Date) {
		if (value) {
			this._timestamp = value
			return this
		}
		return this._timestamp
	}

	public color(): number
	public color(value: string | number): this
	public color(value?: string | number) {
		if (value) {
			if (typeof value === 'string') {
				if (value.startsWith('#')) {
					value = value.substring(1)
				}
				const tmp = parseInt(value, 16)
				if (isNaN(tmp)) {
					throw new Error(`Color could not be set to number (#${value})`)
				}
				value = tmp
			}
			this._color = value
			return this
		}
		return this._color
	}

	public footer(): EmbedFooter | undefined
	public footer(text: string, iconUrl?: string, proxyIconUrl?: string): this
	public footer(text?: string, iconUrl?: string, proxyIconUrl?: string) {
		if (text) {
			// TODO: add limit in Discord.ts
			// if (text.length > 2048) {
			// 	throw new Error(`embed footer text can't be larger than 2048 characters (${text})`)
			// }
			this._footer = {text, icon_url: iconUrl, proxy_icon_url: proxyIconUrl}
			return this
		}
		return this._footer
	}

	public image(): EmbedImage | undefined
	public image(url: string, proxyUrl?: string, width?: number, height?: number): this
	public image(url?: string, proxyUrl?: string, width?: number, height?: number) {
		if (url) {
			this._image = {url, proxy_url: proxyUrl, width, height}
			return this
		}
		return this._image
	}

	public thumbnail(): EmbedImage | undefined
	public thumbnail(url: string, proxyUrl?: string, width?: number, height?: number): this
	public thumbnail(url?: string, proxyUrl?: string, width?: number, height?: number) {
		if (url) {
			this._thumbnail = {url, proxy_url: proxyUrl, width, height}
			return this
		}
		return this._thumbnail
	}

	public video(): EmbedImage | undefined
	public video(url: string, proxyUrl?: string, width?: number, height?: number): this
	public video(url?: string, proxyUrl?: string, width?: number, height?: number) {
		if (url) {
			this._video = {url, proxy_url: proxyUrl, width, height}
			return this
		}
		return this._video
	}

	public provider(): EmbedProvider | undefined
	public provider(name?: string, url?: string): this
	public provider(name?: string, url?: string) {
		if (name || url) {
			this._provider = {name, url}
			return this
		}
		return this._provider
	}

	public author(): EmbedAuthor | undefined
	public author(name: string, url?: string, iconUrl?: string, proxyIconUrl?: string): this
	public author(name?: string, url?: string, iconUrl?: string, proxyIconUrl?: string) {
		if (typeof name === 'undefined') {
			return this._author
		}
		// TODO: add limit in Discord.ts
		// if (name && name.length > 256) {
		// 	throw new Error(`embed author name can't be larger than 256 characters (${name})`)
		// }
		this._author = {name, url, icon_url: iconUrl, proxy_icon_url: proxyIconUrl}
		return this
	}

	public addField(name: string, value: string, inline?: boolean): this {
		if (!this._fields) {
			this._fields = []
		}
		// TODO: add limit in Discord.ts
		// if (this._fields.length > 25) {
		// 	throw new Error(`embed can't have more than 25 fields (embed title: ${this.title()})`)
		// }
		// if (name.length > 256) {
		// 	throw new Error(`embed field title can't be larger than 256 characters (${name})`)
		// }
		// if (value.length > 1024) {
		// 	throw new Error(`embed field value can't be larger than 1024 characters (${value})`)
		// }
		this._fields.push({name, value, inline})
		return this
	}

	public removeField(index: number): this {
		this._fields?.splice(index, 1)
		return this
	}


	public field(): Array<EmbedField>
	public field(index: number): EmbedField
	public field(index: number, name: string, value: string, inline?: boolean): this
	public field(index?: number, name?: string, value?: string, inline?: boolean) {
		if (!this._fields) {
			this._fields = []
		}
		if (typeof index !== 'undefined' && name && value) {
			// TODO: add limit in Discord.ts
			// if (name.length > 256) {
			// 	throw new Error(`embed field title can't be larger than 256 characters (${name})`)
			// }
			// if (value.length > 1024) {
			// 	throw new Error(`embed field value can't be larger than 1024 characters (${value})`)
			// }
			const field = {name, value, inline: inline ?? false}
			this._fields[index] = field
			return this
		} else if (typeof index == 'number') {
			return this._fields[index]
		}
		return this._fields
	}
}
