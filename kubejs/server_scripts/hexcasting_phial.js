ServerEvents.recipes(event => {
	event.shapeless("hexcasting:battery", [Item.of("hexcasting:battery"), Item.of("hexcasting:battery")]).modifyResult((grid, result) => {
		let phials = grid.findAll(Item.of("hexcasting:battery").ignoreNBT())
		let media = 0
		let maxMedia = 0
		let maxMediaCurrent = 0
		let recharge = 0
		let nbt
		phials.forEach(phial => {
			media += phial.nbt["hexcasting:media"]
			recharge += (phial.nbt["hexcasting:start_media"] - phial.nbt["hexcasting:media"])*0.1
			if (maxMediaCurrent < phial.nbt["hexcasting:start_media"]) maxMediaCurrent = phial.nbt["hexcasting:start_media"]
			if (phial.nbt != null) nbt = phial.nbt
		});

		maxMedia = Math.round(maxMediaCurrent + recharge)
		if (media > maxMedia) media = maxMedia
		if (media >= 128*10000) {
			if (nbt == undefined)
				return itemstack
			nbt["hexcasting:media"] = media
			nbt["hexcasting:start_media"] = maxMedia
			return result.withNBT(nbt)
		}
	});
});
