import path from 'node:path'
import { preparePublications, readSite, renderToFile } from './site-rendering.mjs'

const [tomlPath, templatePath, outputPath] = process.argv.slice(2)

if (!tomlPath || !templatePath || !outputPath) {
  console.error('Usage: node script/render.mjs <tomlfile> <template> <outhtml>')
  process.exit(1)
}

const pageName = path.basename(outputPath, '.html')
const data = readSite(tomlPath)

renderToFile(
  templatePath,
  {
    ...data,
    isIndex: pageName === 'index',
    isProfile: pageName === 'profile',
    isPublications: pageName === 'publications',
    navRoot: '',
    pageTitle:
      pageName === 'publications'
        ? `Publications - ${data.profile?.name ?? ''}`
        : pageName === 'profile'
          ? `${data.profile?.name ?? ''} - ${data.profile?.affiliation ?? ''}`
          : pageName === 'index'
            ? data.profile?.name || pageName
            : data.title || data.profile?.name || pageName,
    publications: preparePublications(data.publications),
  },
  outputPath,
)
