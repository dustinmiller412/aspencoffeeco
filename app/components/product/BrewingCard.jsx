export default function BrewingCard({brew, index}) {
  return (
    <article className="border border-border bg-background p-6">
      <p className="mb-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Method {index + 1}
      </p>
      <h3 className="mb-6 font-serif text-2xl">{brew.method}</h3>
      <dl className="space-y-4">
        <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
          <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Grind
          </dt>
          <dd className="text-sm font-medium">{brew.grind}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
          <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Ratio
          </dt>
          <dd className="text-sm font-medium">{brew.ratio}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
          <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Temp
          </dt>
          <dd className="text-sm font-medium">{brew.temp}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
          <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Time
          </dt>
          <dd className="text-sm font-medium">{brew.time}</dd>
        </div>
      </dl>
    </article>
  );
}
