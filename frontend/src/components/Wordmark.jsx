// Wordmark "Gomibox": cada letra con su color candy y extrusión 3D, dispuestas en arco.
const LETTERS = [
  { ch: 'G', c: '#ff4f9a', d: '#b8005e' },
  { ch: 'O', c: '#ff9f1c', d: '#b26500' },
  { ch: 'M', c: '#ffd23f', d: '#a67c00' },
  { ch: 'I', c: '#2ec27e', d: '#0f7a48' },
  { ch: 'B', c: '#35a7ff', d: '#0b64a8' },
  { ch: 'O', c: '#9b6cf0', d: '#5c33b0' },
  { ch: 'X', c: '#ff5f5f', d: '#b71c1c' },
];

// translateY (em) y rotación (deg) por letra → forma de arco/abanico
const ARC = [-0.05, -0.16, -0.24, -0.28, -0.24, -0.16, -0.05];
const TILT = [-11, -7, -3.5, 0, 3.5, 7, 11];

export default function Wordmark({ className = '', bounce = false }) {
  return (
    <span
      role="img"
      aria-label="Gomibox"
      className={`gb-wordmark font-display font-extrabold ${bounce ? 'gb-wordmark--bounce' : ''} ${className}`}
    >
      {LETTERS.map((letter, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="gb-letter"
          style={{ '--c': letter.c, '--d': letter.d, '--y': `${ARC[i]}em`, '--r': `${TILT[i]}deg`, '--i': i }}
        >
          {letter.ch}
        </span>
      ))}
    </span>
  );
}
