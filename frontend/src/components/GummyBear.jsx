import { useId } from 'react';

// Osito de goma kawaii (SVG). Decorativo por defecto; pasa `title` para hacerlo significativo.
export default function GummyBear({ color = '#ff8fc0', className = '', style, title }) {
  const glossId = `gb-bear-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const a11y = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true };

  return (
    <svg viewBox="0 0 100 100" className={className} style={style} {...a11y}>
      <defs>
        <linearGradient id={glossId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.6" />
          <stop offset="0.4" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* orejas */}
      <circle cx="26" cy="26" r="14" fill={color} />
      <circle cx="74" cy="26" r="14" fill={color} />
      <circle cx="26" cy="26" r="6" fill="#fff" opacity="0.35" />
      <circle cx="74" cy="26" r="6" fill="#fff" opacity="0.35" />

      {/* brazos */}
      <ellipse cx="16" cy="58" rx="9" ry="12" fill={color} />
      <ellipse cx="84" cy="58" rx="9" ry="12" fill={color} />

      {/* patas */}
      <ellipse cx="36" cy="90" rx="11" ry="9" fill={color} />
      <ellipse cx="64" cy="90" rx="11" ry="9" fill={color} />

      {/* cuerpo */}
      <ellipse cx="50" cy="58" rx="30" ry="30" fill={color} />

      {/* brillo gelatinoso */}
      <ellipse cx="50" cy="58" rx="30" ry="30" fill={`url(#${glossId})`} />
      <ellipse cx="50" cy="70" rx="16" ry="13" fill="#fff" opacity="0.25" />

      {/* cachetes */}
      <circle cx="33" cy="63" r="5" fill="#ff5f9e" opacity="0.35" />
      <circle cx="67" cy="63" r="5" fill="#ff5f9e" opacity="0.35" />

      {/* ojos */}
      <circle cx="41" cy="55" r="3.6" fill="#3d2b39" />
      <circle cx="59" cy="55" r="3.6" fill="#3d2b39" />
      <circle cx="42.2" cy="53.7" r="1.2" fill="#fff" />
      <circle cx="60.2" cy="53.7" r="1.2" fill="#fff" />

      {/* boquita */}
      <path d="M45.5 64 q4.5 4.5 9 0" stroke="#3d2b39" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
