// Hex Atelier: Hex Wright 2.0.0 loot scope cuts (pass 21).
//
// Removes eleven complete pools from eight Hex Wright chest tables while the
// table JSON is loaded, before Minecraft parses it. Every other pool, and every
// other table, is left exactly as the installed Hex Wright release ships it.
// This replaces pass 20's eight whole-file overrides with the same result.
//
// Removed (see docs/SELECTION.md, passes 20 and 21):
//   chests/boss_spoils          - the explicit Artifact Ruined Tablet pool
//   chests/deep_dungeon         - the three-new-artifact pool
//   chests/boss_spoils/<boss>   - each boss's chosen-player soulforged pool, and
//                                 the new artifact pool of Tower Skeleton,
//                                 Wither Storm and Cog Sentinel
// Earlier-cut items still in retained pools (Eternal weapons, power orbs, gems
// and others) are deliberately untouched here.
//
// A pool is removed only if every one of its entries is a plain item entry
// naming an item on that table's cut list. Retained pools contain none of these
// items, so they cannot match. If the number of removed pools differs from
// what Hex Wright 2.0.0 produces, a warning is logged; the script never
// removes anything outside the rule above. The count is measured from the
// table itself, before and after the edit.

const HEX_ATELIER_LOOT_CUTS = {
  'hexwright:boss_spoils': { items: ['hexwright:artifact_ruined_tablet'], expected: 1 },
  'hexwright:deep_dungeon': { items: ['hexwright:necromancer_sword', 'hexwright:spider_bow', 'hexwright:forge_hammer'], expected: 1 },
  'hexwright:boss_spoils/ancient_golem': { items: ['hexwright:divinity'], expected: 1 },
  'hexwright:boss_spoils/cog_sentinel': { items: ['hexwright:absolution', 'hexwright:forge_hammer'], expected: 2 },
  'hexwright:boss_spoils/magnus': { items: ['hexwright:dragonborn_broadsword'], expected: 1 },
  'hexwright:boss_spoils/talus_knight': { items: ['hexwright:abyss_cleaver'], expected: 1 },
  'hexwright:boss_spoils/tower_skeleton': { items: ['hexwright:shadow_monarch', 'hexwright:necromancer_sword'], expected: 2 },
  'hexwright:boss_spoils/wither_storm': { items: ['hexwright:pestiferous', 'hexwright:spider_bow'], expected: 2 }
}

// True only if every entry in the pool is a plain item entry on the cut list.
function hexAtelierPoolIsCut(pool, cutItems) {
  if (!pool.isJsonObject() || !pool.has('entries')) return false
  let entries = pool.get('entries').getAsJsonArray()
  let entry = null
  if (entries.size() === 0) return false
  for (let i = 0; i < entries.size(); i++) {
    entry = entries.get(i).getAsJsonObject()
    if (!entry.has('type') || String(entry.get('type').getAsString()) !== 'minecraft:item') return false
    if (!entry.has('name') || cutItems.indexOf(String(entry.get('name').getAsString())) < 0) return false
  }
  return true
}

// Without Hex Wright there is nothing to edit; modify() would otherwise
// create empty tables under its IDs.
if (Platform.isLoaded('hexwright')) {
  ServerEvents.chestLootTables(event => {
    Object.keys(HEX_ATELIER_LOOT_CUTS).forEach(id => {
      const cut = HEX_ATELIER_LOOT_CUTS[id]
      event.modify(id, table => {
        // Gson's JsonArray overloads remove() and add(). From KubeJS's Rhino,
        // plain table.pools.remove(i) can bind remove(JsonElement) and
        // silently remove nothing, and add() is ambiguous. Rhino's explicit
        // signature form binds exactly remove(int). Variables are declared
        // outside the loop: this Rhino reports a const inside a loop body as
        // a redeclaration.
        let before = 0
        let removed = 0
        let i = 0
        try {
          before = table.pools.size()
          for (i = before - 1; i >= 0; i--) {
            if (hexAtelierPoolIsCut(table.pools.get(i), cut.items)) table.pools['remove(int)'](i)
          }
          removed = before - table.pools.size()
        } catch (err) {
          // A failed edit leaves the upstream table, with its cut items.
          console.error(`Hex Atelier loot scope: FAILED to edit ${id}; cut items may be obtainable: ${err}`)
          return
        }
        if (removed !== cut.expected) {
          console.warn(`Hex Atelier loot scope: removed ${removed} pool(s) from ${id}, expected ${cut.expected}; check the Hex Wright version`)
        } else {
          console.info(`Hex Atelier loot scope: removed ${removed} pool(s) from ${id}`)
        }
      })
    })
  })
}
