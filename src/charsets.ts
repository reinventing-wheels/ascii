/* eslint-disable prefer-template */
import { chr, str } from './lib/utils'

const expand = (pair: string) => {
  const [a, b] = [...pair].map(chr)
  const codes = [...Array(b - a).keys()].map(n => a + n)
  return str(...codes, b)
}

export const ascii =
  expand(' ^') + expand('`~')

export const extended =
  ascii + expand('¡§') + '®°±©«¬´µ·»¿×÷'

export const extra =
  extended + expand('‘•') + '‹›∙√∞'
