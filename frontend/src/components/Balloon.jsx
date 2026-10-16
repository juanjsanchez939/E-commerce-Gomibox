import { useId } from 'react';

// Globo kawaii estilo claymorphism: cuerpo con volumen suave (highlight + sombra),
// nudo e hilo ondulado. Decorativo por defecto; pasa `title` para hacerlo significativo.
export default function Balloon({ color = '#ff8fc0', className = '', style, title, string = true }) {
  const shadeId = `gb-balloon-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const a11y = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true };

  return (
    <svg viewBox="0 0 60 110" className={className} style={style} {...a11y}>
      <defs>
        <radialGradient id={shadeId} cx="34%" cy="26%" r="78%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.8" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.05" />
          <stop offset="1" stopColor="#000" stopOpacity="0.14" />
        </radialGradient>
      </defs>

      {string && (
        <path d="M30 76 q6 7 0 14 q-6 7 0 14" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.65" />
      )}

      {/* nudo */}
      <path d="M30 67 l-5 8 h10 z" fill={color} />

      {/* cuerpo */}
      <ellipse cx="30" cy="40" rx="23" ry="29" fill={color} />
      <ellipse cx="30" cy="40" rx="23" ry="29" fill={`url(#${shadeId})`} />

      {/* brillo */}
      <ellipse cx="20" cy="27" rx="6" ry="9" fill="#fff" opacity="0.55" transform="rotate(-20 20 27)" />
    </svg>
  );
}
