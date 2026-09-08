import React, { useEffect, useState } from 'react';

export function Card({ title, children, className = '' }) {
  return (
    <section className={`card ${className}`}>
      {title && <p className="card-title">{title}</p>}
      {children}
    </section>
  );
}

/* A stat tile. `state` drives colour, and every coloured tile also carries a
   word in its note - status is never colour alone. */
export function Tile({ label, value, of, note, state, meter }) {
  return (
    <div className={`tile${state ? ` state-${state}` : ''}`}>
      <p className="tile-label">{label}</p>
      <p className="tile-value">{value}{of != null && <span className="of"> / {of}</span>}</p>
      {meter != null && (
        <div className={`meter${state ? ` ${state}` : ''}`}>
          <i style={{ width: `${Math.max(0, Math.min(1, meter)) * 100}%` }} />
        </div>
      )}
      {note && <p className="tile-note">{note}</p>}
    </div>
  );
}

export function Callout({ kind = 'info', icon, title, children }) {
  return (
    <div className={`callout ${kind}`}>
      {title && <h4>{icon && <i className="callout-icon" aria-hidden="true">{icon}</i>}{title}</h4>}
      {children}
    </div>
  );
}

export function Tag({ tag }) {
  if (!tag) return <span className="tag" style={{ borderStyle: 'dotted', color: 'var(--muted)' }}>—</span>;
  return <span className={`tag tag-${tag.toLowerCase()}`}>[{tag}]</span>;
}

export function Chip({ kind, children }) {
  return <span className={`chip${kind ? ` chip-${kind}` : ''}`}>{children}</span>;
}

export function courseKind(code) {
  return code.startsWith('PSY') ? 'psy' : 'sta';
}

export function Copy({ text, label = 'Copy' }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!done) return undefined;
    const t = setTimeout(() => setDone(false), 1600);
    return () => clearTimeout(t);
  }, [done]);
  return (
    <button
      type="button"
      className="btn btn-sm"
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
      {done ? 'Copied' : label}
    </button>
  );
}

/* A horizontal stacked bar. Segments are a single-hue sequential ramp
   (recalled → verified → in hand) with a 2px surface gap between fills and a
   count inside each segment, so the encoding is never colour alone. */
export function StackedBar({ label, counts, order, total, labels }) {
  return (
    <div className="bar-row">
      <span className="strip-label">{label}</span>
      <div className="bar-track" role="img"
           aria-label={order.map((k) => `${counts[k]} ${labels[k]}`).join(', ')}>
        {order.map((k) => (
          counts[k] > 0 && (
            <div key={k} className={`bar-seg seg-${k}`}
                 style={{ flexGrow: counts[k], flexBasis: 0 }}
                 title={`${counts[k]} ${labels[k]}`}>
              {counts[k] / total > 0.12 ? counts[k] : ''}
            </div>
          )
        ))}
      </div>
    </div>
  );
}
