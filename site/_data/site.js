// Site data: website.toml is the single source of truth for profile,
// research, CV, and publications data. It is parsed once and spread at the
// top level, so templates access `profile`, `research`, `cv`,
// `publications`, and the derived `preparedPublications` directly.

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import TOML from 'smol-toml'
import { preparePublications } from '../../src/lib/pure.mjs'

const site = TOML.parse(readFileSync(join(process.cwd(), 'website.toml'), 'utf8'))

export default () => ({
  ...site,
  preparedPublications: preparePublications(site.publications),
})
