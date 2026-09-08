import React, { useEffect, useId, useRef, useState } from 'react';

/* A card. Its title is a real heading, and the section is labelled by it, so a
   screen reader gets the same outline a sighted reader gets from the type. */
export function Card({ title, as: Heading = 'h3', children, className = '', actions }) {
  const id = useId();
  return (
    <section className={`card ${className}`} aria-labelledby={title ? id : undefined}>
      {title && (
        <div className="card-head">
          <Heading className="card-title" id={id}>{title}</Heading>
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

/* True on the render after `value` changes - drives a one-shot highlight so a
   number that moved is visibly the number that moved. */
export function useChanged(value, ms = 900) {
  const first = useRef(true);
  const prev = useRef(value);
  const [hot, setHot] = useState(false);
  useEffect(() => {
    if (first.current) { first.current = false; prev.current = value; return undefined; }
    if (prev.current === value) return undefined;
    prev.current = value;
    setHot(true);
    const t = setTimeout(() => setHot(false), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return hot;
}

/* A stat tile. `state` drives colour, and every coloured tile also carries a
   word in its note - status is never colour alone. */
export function Tile({ label, value, of, note, state, meter, sub }) {
  const hot = useChanged(`${value}/${of}`);
  return (
    <div className={`tile${state ? ` state-${state}` : ''}${hot ? ' is-changed' : ''}`}>
      <p className="tile-label">{label}</p>
      <p className="tile-value">{value}{of != null && <span className="of"> / {of}</span>}</p>
      {sub && <p className="tile-sub">{sub}</p>}
      {meter != null && (
        <div className={`meter${state ? ` ${state}` : ''}`}>
          <i style={{ width: `${Math.max(0, Math.min(1, meter)) * 100}%` }} />
        </div>
      )}
      {note && <p className="tile-note">{note}</p>}
    </div>
  );
}

export function Callout({ kind = 'info', icon, title, children, as: Heading = 'h3' }) {
  return (
    <div className={`callout ${kind}`}>
      {title && <Heading>{icon && <i className="callout-icon" aria-hidden="true">{icon}</i>}{title}</Heading>}
      {children}
    </div>
  );
}

/* More than two decisions above the fold is a wall, not a briefing. The first
   two stay open; the rest fold into one disclosure that still says how many. */
export function CalloutStack({ children, keep = 2 }) {
  const items = React.Children.toArray(children).filter(Boolean);
  const [open, setOpen] = useState(false);
  if (items.length <= keep) return <>{items}</>;
  const rest = items.length - keep;
  return (
    <>
      {items.slice(0, keep)}
      <div className="callout-more">
        <button type="button" className="btn btn-sm btn-quiet" aria-expanded={open}
                onClick={() => setOpen((v) => !v)}>
          {open ? `Hide ${rest} more` : `${rest} more to decide`}
        </button>
      </div>
      {open && items.slice(keep)}
    </>
  );
}

export function Tag({ tag }) {
  if (!tag) return <span className="tag tag-none">—</span>;
  return <span className={`tag tag-${tag.toLowerCase()}`}>[{tag}]</span>;
}

export function Chip({ kind, children }) {
  return <span className={`chip${kind ? ` chip-${kind}` : ''}`}>{children}</span>;
}

export function courseKind(code) {
  return String(code).startsWith('PSY') ? 'psy' : 'sta';
}

export function Copy({ text, label = 'Copy', className = 'btn btn-sm' }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!done) return undefined;
    const t = setTimeout(() => setDone(false), 1600);
    return () => clearTimeout(t);
  }, [done]);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
        } catch {
          setDone(false);
          window.prompt('Copy this:', text);
        }
      }}
    >
      <span className="btn-swap">
        <span aria-hidden={done ? 'true' : undefined} className={done ? 'is-out' : ''}>{label}</span>
        {done && <span className="btn-swap-in">Copied</span>}
      </span>
    </button>
  );
}

/* A horizontal stacked bar, one row per course.
 *
 * Two things the first version got wrong and this one does not: the tracks are
 * scaled against the largest total, so a row of 6 is not drawn the same width
 * as a row of 11 and "2 in hand" is not twice as wide in one row as in the
 * other; and no count lives inside a segment, so no count can be dropped for
 * being 9% of the row. The numbers sit beside the bar, in ink, always. */
export function StackedBar({ label, counts, order, total, labels, scaleTo }) {
  const max = Math.max(1, scaleTo || total);
  return (
    <div className="bar-row">
      <span className="strip-label">{label}</span>
      <div className="bar-track-wrap">
        <div className="bar-track" style={{ width: `${(total / max) * 100}%` }} role="img"
             aria-label={`${label}: ${order.map((k) => `${counts[k]} ${labels[k]}`).join(', ')}, ${total} in total`}>
          {order.map((k) => (
            counts[k] > 0 && (
              <div key={k} className={`bar-seg seg-${k}`}
                   style={{ flexGrow: counts[k], flexBasis: 0 }} />
            )
          ))}
        </div>
      </div>
      <span className="bar-counts" aria-hidden="true">
        {order.map((k) => (
          <span key={k} className={counts[k] ? '' : 'is-zero'}>
            <i className={`swatch swatch-${k}`} />{counts[k]}
          </span>
        ))}
        <span className="bar-total">/ {total}</span>
      </span>
    </div>
  );
}
