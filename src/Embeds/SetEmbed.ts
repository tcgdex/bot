import { Set } from '@tcgdex/sdk'
import BaseEmbed from './BaseEmbed'

export default function(set: Set) {
	const embed = BaseEmbed()
		.title(set.name)
		.description(`This set is part of the **${set.serie.name}** serie.
It was released on the ${set.releaseDate}`)
		.addField('ID', `TCGdex ID: ${set.id}\nTCG Online ID: ${set.tcgOnline ?? ''}`)
		.addField('Competitions Availability', `${set.legal.standard ? '✅' : '❎'} Standard
${set.legal.expanded ? '✅' : '❎'} Expanded
✅ Unlimited`)
		.addField('Card Count', `Total: \`${set.cardCount.total}\`
Official: \`${set.cardCount.official}\``)
		.addField('Variants count', `Normal: \`${set.cardCount.normal ?? 0}\`
Reverse: \`${set.cardCount.reverse ?? 0}\`
holo: \`${set.cardCount.holo ?? 0}\`
first Edition \`${set.cardCount.firstEd ?? 0}\``)
		.timestamp(new Date(set.releaseDate))

		if (set.logo) {
			embed.image(`${set.logo}.png`)
		}
		if (set.symbol) {
			embed.thumbnail(`${set.symbol}.png`)
		}

		return embed
}
