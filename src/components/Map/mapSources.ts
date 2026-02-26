import type { SourceMap } from '@types'

const sources: SourceMap = {
  countyboundaries: {
    type: 'vector',
    url: 'https://tiles.dvrpc.org/data/boundaries/countyboundaries',
  },
  municipalboundaries: {
    type: 'vector',
    url: 'https://tiles.dvrpc.org/data/boundaries/municipalboundaries',
  },
}

export default sources
