import type { InferProps } from 'void'
import { defineHandler, defineHead } from 'void'
import { postSummaries } from '../src/lib/typst'
import { site } from '../src/lib/site'

export const loader = defineHandler(async () => {
  return {
    name: site.profile?.name ?? '',
    posts: postSummaries(),
  }
})

export type Props = InferProps<typeof loader>

export const head = defineHead<Props>((_c, props) => ({
  title: `Blog - ${props.name}`,
}))
