export default function MarqueeStrip() {
  const MARQUEE_ITEMS = [
    'Small-batch roasted',
    'Single origin',
    'Specialty coffee',
    'Ethically sourced',
    'Roasted in Pittsburgh',
    'Rotating selections',
    'Hand crafted',
    // duplicate for seamless loop
    'Small-batch roasted',
    'Single origin',
    'Specialty coffee',
    'Ethically sourced',
    'Roasted in Pittsburgh',
    'Rotating selections',
    'Hand crafted',
  ];

  return (
    <div className="a-marquee-strip">
      <div className="a-marquee-inner">
        {MARQUEE_ITEMS.map((item, i) => (
          <span key={i} className="a-marquee-item">
            {item}
            <span className="a-marquee-dot" />
          </span>
        ))}
      </div>
    </div>
  );
}
