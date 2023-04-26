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

export interface EmbedStructure {
	title?: string
	description?: string
	url?: string
	timestamp?: Date
	/**
	 * if it's a string define the color as a Hexadecimal value
	 */
	color?: number
	footer?: EmbedFooter
	image?: EmbedImage
	thumbnail?: EmbedImage
	video?: EmbedImage
	provider?: EmbedProvider
	author?: EmbedAuthor
	fields?: Array<EmbedField>
}

/**
 * Global Embed object
*/
export default class Embed {

	private definition: EmbedStructure = {}

	public constructor(title?: string, description?: string) {
		this.definition.title = title ?? ' '
		this.definition.description = description ?? ' '
	}

	public title(): EmbedStructure['title']
	public title(value: EmbedStructure['title']): this
	public title(value?: EmbedStructure['title']) {
		if (value) {
			if (value.length > 256) {
				throw new Error(`embed title can't be larger than 256 characters (${value})`)
			}
			this.definition.title = value
			return this
		}
		return this.definition.title
	}

	public description(): EmbedStructure['description']
	public description(value: EmbedStructure['description']): this
	public description(value?: EmbedStructure['description']) {
		if (value) {
			if (value.length > 4096) {
				throw new Error(`embed title can't be larger than 4096 characters (${value})`)
			}
			this.definition.description = value
			return this
		}
		return this.definition.description
	}

	public url(): EmbedStructure['url']
	public url(value: EmbedStructure['url']): this
	public url(value?: EmbedStructure['url']) {
		if (value) {
			this.definition.url = value
			return this
		}
		return this.definition.url
	}

	public timestamp(): EmbedStructure['timestamp']
	public timestamp(value: EmbedStructure['timestamp']): this
	public timestamp(value?: EmbedStructure['timestamp']) {
		if (value) {
			this.definition.timestamp = value
			return this
		}
		return this.definition.timestamp
	}

	public color(): number
	public color(value: string | number): this
	public color(value?: string | number) {
		if (value) {
			if (typeof value === 'string') {
				if (value.startsWith('#')) {
					value = value.substr(1)
				}
				const tmp = parseInt(value, 16)
				if (isNaN(tmp)) {
					throw new Error(`Color could not be set to number (#${value})`)
				}
				value = tmp
			}
			this.definition.color = value
			return this
		}
		return this.definition.color
	}

	public footer(): EmbedFooter
	public footer(text: string, iconUrl?: string, proxyIconUrl?: string): this
	public footer(text?: string, iconUrl?: string, proxyIconUrl?: string) {
		if (text) {
			if (text.length > 2048) {
				throw new Error(`embed footer text can't be larger than 2048 characters (${text})`)
			}
			this.definition.footer = {text, icon_url: iconUrl, proxy_icon_url: proxyIconUrl}
			return this
		}
		return this.definition.footer
	}

	public image(): EmbedImage
	public image(url: string, proxyUrl?: string, width?: number, height?: number): this
	public image(url?: string, proxyUrl?: string, width?: number, height?: number) {
		if (url) {
			this.definition.image = {url, proxy_url: proxyUrl, width, height}
			return this
		}
		return this.definition.image
	}

	public thumbnail(): EmbedImage
	public thumbnail(url: string, proxyUrl?: string, width?: number, height?: number): this
	public thumbnail(url?: string, proxyUrl?: string, width?: number, height?: number) {
		if (url) {
			this.definition.thumbnail = {url, proxy_url: proxyUrl, width, height}
			return this
		}
		return this.definition.thumbnail
	}

	public video(): EmbedImage
	public video(url: string, proxyUrl?: string, width?: number, height?: number): this
	public video(url?: string, proxyUrl?: string, width?: number, height?: number) {
		if (url) {
			this.definition.video = {url, proxy_url: proxyUrl, width, height}
			return this
		}
		return this.definition.video
	}

	public provider(): EmbedStructure['provider']
	public provider(name?: string, url?: string): this
	public provider(name?: string, url?: string) {
		if (name || url) {
			this.definition.provider = {name, url}
			return this
		}
		return this.definition.provider
	}

	public author(): EmbedStructure['author']
	public author(name: string, url?: string, iconUrl?: string, proxyIconUrl?: string): this
	public author(name?: string, url?: string, iconUrl?: string, proxyIconUrl?: string) {
		if (url || iconUrl || proxyIconUrl) {
			if (!name) {
				throw new Error('embed author MUST have a name')
			}
			if (name && name.length > 256) {
				throw new Error(`embed author name can't be larger than 256 characters (${name})`)
			}
			this.definition.author = {name, url, icon_url: iconUrl, proxy_icon_url: proxyIconUrl}
			return this
		}
		return this.definition.author
	}

	public addField(name: string, value: string, inline?: boolean): this {
		if (!this.definition.fields) {
			this.definition.fields = []
		}
		if (this.definition.fields.length > 25) {
			throw new Error(`embed can't have more than 25 fields (embed title: ${this.title()})`)
		}
		if (name.length > 256) {
			throw new Error(`embed field title can't be larger than 256 characters (${name})`)
		}
		if (value.length > 1024) {
			throw new Error(`embed field value can't be larger than 1024 characters (${value})`)
		}
		this.definition.fields.push({name, value, inline})
		return this
	}

	public removeField(index: number): this {
		this.definition.fields?.splice(index, 1)
		return this
	}


	public field(): Array<EmbedField>
	public field(index: number): EmbedField
	public field(index: number, name: string, value: string, inline?: boolean): this
	public field(index?: number, name?: string, value?: string, inline?: boolean) {
		if (!this.definition.fields) {
			this.definition.fields = []
		}
		if (typeof index !== 'undefined' && name && value) {
			if (name.length > 256) {
				throw new Error(`embed field title can't be larger than 256 characters (${name})`)
			}
			if (value.length > 1024) {
				throw new Error(`embed field value can't be larger than 1024 characters (${value})`)
			}
			const field = {name, value, inline: inline ?? false}
			this.definition.fields[index] = field
			return this
		} else if (typeof index == 'number') {
			return this.definition.fields[index]
		}
		return this.definition.fields
	}
}
