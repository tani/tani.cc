import type { InferProps } from 'void'
import { defineHandler, defineHead } from 'void'
import { preparePublications, site } from '../src/lib/site'

export const loader = defineHandler(async () => {
  return {
    name: site.profile?.name ?? '',
    publications: preparePublications(site.publications),
  }
})

export type Props = InferProps<typeof loader>

export const head = defineHead<Props>((_c, props) => ({
  title: `Publications - ${props.name}`,
}))
