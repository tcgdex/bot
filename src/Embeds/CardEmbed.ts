import { Card } from '@tcgdex/sdk'
import { replaceTypesByEmojis } from '../Utils'
import BaseEmbed from './BaseEmbed'

/**
 * Transform Card to Discord Embeds
 */
export default function(card: Card) {
	const embed = BaseEmbed()

	const items = Object.keys(card)
		.filter((item) => ![
			'types', 'abilities', 'name', 'image',
			'variants', 'legal', 'attacks', 'set',
			'weaknesses', 'resistances', 'illustrator',
			'id', 'localId', 'suffix', 'category', 'retreat'
		].includes(item))
	for (const field of items) {
		const display = field.substring(0, 1).toUpperCase() + field.substr(1)
		const value = card[field as 'name'] ?? '---'
		if (Array.isArray(value)) {
			embed.addField(display, replaceTypesByEmojis(value.join(', ')), true)
		} else {
			embed.addField(display, replaceTypesByEmojis(value.toString()), true)
		}
	}
	// Title
	let title = ''
	if (card.stage) {
		title += card.stage + ' '
	}
	if (card.types) {
		title += replaceTypesByEmojis(card.types.join(' ')) + ' '
	}
	title += card.name
	if (card.suffix && !card.name.endsWith(card.suffix))  {
		title += ` ${card.suffix}`
	}
	if (card.hp) {
		title += ` - HP${card.hp}`
	}

	// Other informations
	if (card.localId) {
		embed.addField('Identifier', `TCGdex ID: \`${card.id}\`\nCard number: \`${card.localId}\``, true)
	}
	if (card.variants) {
		embed.addField('Variants', `${card.variants.normal ? '✅' : '❎'} Normal\n${card.variants.reverse ? '✅' : '❎'} Reverse\n${card.variants.holo ? '✅' : '❎'} Holo\n${card.variants.firstEdition ? '✅' : '❎'} 1st Edition`, true)
	}
	if (card.legal) {
		embed.addField('Legality', `${card.legal.standard ? '✅' : '❎'} Standard\n${card.legal.expanded ? '✅' : '❎'} Expanded\n✅ Unlimited`, true)
	}
	if (typeof card.retreat === 'number') {
		embed.addField('Retreat Cost', replaceTypesByEmojis(Array.from(new Array(card.retreat)).map(() => 'Colorless').join(' ')))
	}
	if (card.image) {
		embed.url(
			card.image
				.replace('assets.tcgdex.net/', 'www.tcgdex.net/database/')
				.replace('/en/', '/')
		)
		embed.image(`${card.image}/high.png`)
	}
	if (card.abilities) {
		embed.addField(
			'Abilities',
			card.abilities.map((a) => `${a.type} - **${a.name}**\n${a.effect}`).join('\n'),
			false
		)
	}
	if (card.attacks) {
		embed.addField(
			'Attacks',
			card.attacks.map((a) => {
				let text = ''
				if (a.cost) {
					text += replaceTypesByEmojis(a.cost?.join(' ')) + ' '
				}
				text += `**${a.name}**`
				if (a.damage) {
					text += ` - ${a.damage}`
				}
				if (a.effect) {
					text += `\n${a.effect}`
				}
				return text
			}).join('\n'),
			false
		)
	}
	embed
		.author(card.illustrator ?? '', undefined, card.set.symbol ? `${card.set.symbol}.png` : undefined)
		.title(title)
		.addField('Set', card.set.name, true)

	return embed
}
