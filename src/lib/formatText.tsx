import React, { ReactNode } from 'react'

/**
 * Regex untuk mendeteksi tag format teks:
 * 1. <b> atau <strong>: <(?:b|strong)>(.+?)<\/(?:b|strong)>
 * 2. <i> atau <em>: <(?:i|em)>(.+?)<\/(?:i|em)>
 * 3. <u>: <u>(.+?)<\/u>
 * 4. Markdown bold: \*\*(.+?)\*\*
 * 5. Markdown underscore: __(.+?)__
 * 6. Markdown italic: \*(.+?)\*
 */
const FORMAT_REGEX =
  /(?:<(b|strong)>(.+?)<\/(?:b|strong)>)|(?:<(i|em)>(.+?)<\/(?:i|em)>)|(?:<u>(.+?)<\/u>)|(?:\*\*(.+?)\*\*)|(?:__(.+?)__)|(?:\*(.+?)\*)/s

/**
 * Mengubah string dengan format teks (bold, italic, underscore/underline)
 * menjadi ReactNode yang aman tanpa dangerouslySetInnerHTML.
 */
export function parseFormattedText(text: string, keyPrefix = 'fmt'): ReactNode[] {
  if (!text) return []

  const match = FORMAT_REGEX.exec(text)
  if (!match) {
    return [text]
  }

  const nodes: ReactNode[] = []
  const before = text.slice(0, match.index)
  if (before) {
    nodes.push(before)
  }

  const matchedString = match[0]
  const key = `${keyPrefix}-${match.index}`

  if (match[1] || match[6]) {
    // Bold: <b> / <strong> / **teks**
    const content = match[2] ?? match[6] ?? ''
    nodes.push(
      <strong key={key} className="story-formatted-bold font-semibold">
        {parseFormattedText(content, `${key}-b`)}
      </strong>
    )
  } else if (match[3] || match[8]) {
    // Italic: <i> / <em> / *teks*
    const content = match[4] ?? match[8] ?? ''
    nodes.push(
      <em key={key} className="story-formatted-italic italic">
        {parseFormattedText(content, `${key}-i`)}
      </em>
    )
  } else if (match[5] || match[7]) {
    // Underscore: <u> / __teks__
    const content = match[5] ?? match[7] ?? ''
    nodes.push(
      <u key={key} className="story-formatted-underline underline underline-offset-4">
        {parseFormattedText(content, `${key}-u`)}
      </u>
    )
  }

  const after = text.slice(match.index + matchedString.length)
  if (after) {
    nodes.push(...parseFormattedText(after, `${keyPrefix}-after`))
  }

  return nodes
}
