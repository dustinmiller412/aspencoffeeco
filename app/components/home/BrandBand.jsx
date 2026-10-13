import {Logo} from '~/components/Header';
import {ContourDivider} from '~/components/ContourDivider';

export default function BrandBand() {
  return (
    <section className="on-ink bg-ink p-0 text-paper-2">
      <ContourDivider className="text-paper-2/25" />
      <div className="px-6 pb-14 pt-8 md:pb-16">
        <div className="mx-auto grid max-w-7xl items-end gap-8 md:grid-cols-[1.6fr_1fr]">
          <Logo variant="wordmark" label="ASPN" className="w-full text-glow" />
          <div>
            <p className="eyebrow mb-3 text-glow">Roasted in Pittsburgh, PA</p>
            <p className="m-0 text-lg">
              Small-batch coffee, rotating single origins, and the stories of the people who grew it.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
