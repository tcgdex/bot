import { Serie } from '@tcgdex/sdk'
import BaseEmbed from './BaseEmbed'

export default function(serie: Serie) {
	return BaseEmbed()
		.title(serie.name)
		.addField('ID', 'TCGdex ID: ' + serie.id)
}
