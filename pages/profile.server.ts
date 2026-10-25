import type { InferProps } from 'void'
import { defineHandler, defineHead } from 'void'
import { site } from '../src/lib/site'

export const loader = defineHandler(async () => {
  return {
    profile: site.profile,
    research: site.research,
    cv: site.cv,
  }
})

export type Props = InferProps<typeof loader>

export const head = defineHead<Props>((_c, props) => ({
  title: `${props.profile?.name ?? ''} - ${props.profile?.affiliation ?? ''}`,
}))
