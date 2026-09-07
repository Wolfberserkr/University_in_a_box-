/* A small Markdown renderer.
 *
 * The repository's prose is the site's prose - week notes, cut-list rationale,
 * the assessment parts - so it has to render, but it is our own text from our
 * own files. That is a narrow enough job to do in ~150 lines of React elements
 * rather than pulling in a parser and an HTML sanitiser. No dangerouslySetInnerHTML.
 *
 * Supported: headings, ---, fenced code, blockquotes, ordered and unordered
 * lists, pipe tables, paragraphs; inline code, bold, italic, links, `[V]`-style
 * tags. Anything else falls through as text, which is the correct failure.
 */
import React from 'react';

const INLINE = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*\n]+\*)|(\[[^\]]+\]\([^)]+\))/g;

export function Inline({ text }) {
  if (!text) return null;
  const out = [];
  let last = 0;
  let m;
  INLINE.lastIndex = 0;
  while ((m = INLINE.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    const key = `${m.index}`;
    if (t.startsWith('`')) {
      const inner = t.slice(1, -1);
      const tag = inner.match(/^\[([VRH])\]$/);
      out.push(
        tag
          ? <span key={key} className={`tag tag-${tag[1].toLowerCase()}`}>[{tag[1]}]</span>
          : <code key={key}>{inner}</code>
      );
    } else if (t.startsWith('**')) {
      out.push(<strong key={key}><Inline text={t.slice(2, -2)} /></strong>);
    } else if (t.startsWith('*')) {
      out.push(<em key={key}><Inline text={t.slice(1, -1)} /></em>);
    } else {
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(t);
      const [, label, href] = link;
      const external = /^https?:/.test(href);
      out.push(
        external
          ? <a key={key} href={href} target="_blank" rel="noreferrer noopener">{label}</a>
          : <code key={key} className="repo-path">{label}</code>
      );
    }
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

const isDivider = (l) => /^\s*\|?[\s|:-]+\|[\s|:-]*$/.test(l) && l.includes('-');
const cells = (l) => l.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map((c) => c.trim());

function Table({ lines }) {
  const headers = cells(lines[0]);
  const rows = lines.slice(2).map(cells);
  return (
    <div className="table-scroll">
      <table>
        <thead><tr>{headers.map((h, i) => <th key={i}><Inline text={h} /></th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {headers.map((_, j) => <td key={j}><Inline text={r[j] || ''} /></td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Markdown({ md, className = 'prose' }) {
  if (!md) return null;
  const lines = md.split('\n');
  const out = [];
  let i = 0;
  let k = 0;

  const push = (el) => out.push(React.cloneElement(el, { key: k++ }));

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    if (line.startsWith('```')) {
      const buf = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) buf.push(lines[i++]);
      i++;
      push(<pre><code>{buf.join('\n')}</code></pre>);
      continue;
    }

    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      const Tag = `h${Math.min(6, h[1].length + 1)}`;
      push(<Tag><Inline text={h[2]} /></Tag>);
      i++;
      continue;
    }

    if (/^\s*(---+|___+|\*\*\*+)\s*$/.test(line)) { push(<hr />); i++; continue; }

    if (line.trim().startsWith('|') && i + 1 < lines.length && isDivider(lines[i + 1])) {
      const buf = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) buf.push(lines[i++]);
      push(<Table lines={buf} />);
      continue;
    }

    if (line.startsWith('>')) {
      const buf = [];
      while (i < lines.length && lines[i].startsWith('>')) buf.push(lines[i++].replace(/^>\s?/, ''));
      push(<blockquote><Markdown md={buf.join('\n')} className="" /></blockquote>);
      continue;
    }

    const bullet = /^\s*[-*]\s+/;
    const numbered = /^\s*\d+\.\s+/;
    if (bullet.test(line) || numbered.test(line)) {
      const ordered = numbered.test(line);
      const re = ordered ? numbered : bullet;
      const items = [];
      while (i < lines.length && re.test(lines[i])) {
        let item = lines[i].replace(re, '');
        i++;
        // continuation lines belonging to the same item
        while (i < lines.length && lines[i].trim() && !re.test(lines[i])
               && !/^\s*[-*]\s+/.test(lines[i]) && !/^\s*\d+\.\s+/.test(lines[i])
               && !lines[i].startsWith('#') && !lines[i].trim().startsWith('|')) {
          item += ' ' + lines[i].trim();
          i++;
        }
        items.push(item);
      }
      const List = ordered ? 'ol' : 'ul';
      push(<List>{items.map((it, n) => <li key={n}><Inline text={it} /></li>)}</List>);
      continue;
    }

    const buf = [];
    while (i < lines.length && lines[i].trim() && !lines[i].startsWith('#')
           && !lines[i].trim().startsWith('|') && !lines[i].startsWith('>')
           && !lines[i].startsWith('```') && !/^\s*[-*]\s+/.test(lines[i])
           && !/^\s*\d+\.\s+/.test(lines[i]) && !/^\s*---+\s*$/.test(lines[i])) {
      buf.push(lines[i++]);
    }
    if (buf.length) push(<p><Inline text={buf.join(' ')} /></p>);
    else i++;
  }

  return <div className={className}>{out}</div>;
}
