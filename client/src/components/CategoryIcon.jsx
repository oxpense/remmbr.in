const categoryIcons = {
  'Driving License': { icon: '🚗', color: '#93c5fd' },
  'Vehicle Insurance': { icon: '🛡️', color: '#6ee7b7' },
  'Passport': { icon: '🛂', color: '#c4b5fd' },
  'PUC (Pollution)': { icon: '🌿', color: '#86efac' },
  'Bike Service': { icon: '🏍️', color: '#fcd34d' },
  'Car Insurance': { icon: '🚙', color: '#fda4af' },
  'Health Insurance': { icon: '🏥', color: '#f9a8d4' },
  'Life Insurance': { icon: '❤️', color: '#fda4af' },
  'Credit Card': { icon: '💳', color: '#a5b4fc' },
  'Subscription': { icon: '📺', color: '#c4b5fd' },
  'Domain / Hosting': { icon: '🌐', color: '#67e8f9' },
  'Visa': { icon: '✈️', color: '#5eead4' },
  'ID Card': { icon: '🪪', color: '#94a3b8' },
  'Birth Certificate': { icon: '📜', color: '#fdba74' },
  'Property Tax': { icon: '🏠', color: '#a8a29e' },
  'Professional License': { icon: '📋', color: '#7dd3fc' },
  'Software License': { icon: '💻', color: '#c4b5fd' },
  'Insurance (Other)': { icon: '📄', color: '#e879f9' },
  'Other': { icon: '📌', color: '#94a3b8' },
};

export function getCategoryInfo(category) {
  return categoryIcons[category] || { icon: '📌', color: '#94a3b8' };
}

export default function CategoryIcon({ category, size = 'md' }) {
  const info = getCategoryInfo(category);
  const sizes = { sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base', lg: 'w-14 h-14 text-2xl' };

  return (
    <div className={`${sizes[size]} rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105`}
      style={{
        background: `${info.color}12`,
        border: `1px solid ${info.color}18`,
        backdropFilter: 'blur(4px)',
      }}>
      <span role="img" aria-label={category}>{info.icon}</span>
    </div>
  );
}
