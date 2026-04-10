const ROAST_LEVELS = ['Light', 'Light-Medium', 'Medium', 'Medium-Dark', 'Dark'];

const ROAST_LEVEL_ALIASES = {
  light: 'Light',
  'light medium': 'Light-Medium',
  'light-medium': 'Light-Medium',
  medium: 'Medium',
  'medium dark': 'Medium-Dark',
  'medium-dark': 'Medium-Dark',
  dark: 'Dark',
};

function normalizeRoastLevel(level) {
  const normalized = String(level ?? '')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, ' ');

  return ROAST_LEVEL_ALIASES[normalized] || 'Medium';
}

export default function RoastMeter({level = 'Medium'}) {
   const activeLevel = normalizeRoastLevel(level);
  const activeIndex = ROAST_LEVELS.indexOf(activeLevel);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-5 gap-2">
        {ROAST_LEVELS.map((roastLevel, index) => (
          <div
            key={roastLevel}
            className={`h-2 ${
              index <= activeIndex ? 'bg-foreground' : 'bg-border'
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <span>Light</span>
        <span>Dark</span>
      </div>
    </div>
  );
}
