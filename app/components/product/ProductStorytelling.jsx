import {useEffect, useMemo, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';

function hasValue(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function getMetafieldImage(metafield) {
  return metafield?.reference?.image || null;
}

function getStorySteps(product, activeImage) {
  const fallbackImage = activeImage || product?.images?.nodes?.[0] || null;

  const possibleSteps = [
    {
      id: 'overview',
      eyebrow: 'Overview',
      title: product?.title || 'This Coffee',
      body: product?.storytellingOverview?.value || '',
      image:
        getMetafieldImage(product?.storytellingOverviewImage) || fallbackImage,
      kicker: product?.vendor || 'Aspen Coffee Co',
    },
    {
      id: 'producer',
      eyebrow: 'Producer',
      title: 'Meet the Producer',
      body: product?.storytellingProducer?.value || '',
      image:
        getMetafieldImage(product?.storytellingProducerImage) || fallbackImage,
      kicker: 'People matter',
    },
    {
      id: 'origin',
      eyebrow: 'Origin',
      title: 'Where it comes from',
      body: product?.storytellingOrigin?.value || '',
      image:
        getMetafieldImage(product?.storytellingOriginImage) || fallbackImage,
      kicker: 'Place matters',
    },
    {
      id: 'process',
      eyebrow: 'Process',
      title: 'How it was processed',
      body: product?.storytellingProcess?.value || '',
      image:
        getMetafieldImage(product?.storytellingProcessImage) || fallbackImage,
      kicker: 'Processing shapes the cup',
    },
    {
      id: 'roast',
      eyebrow: 'Roast',
      title: 'How we roast it',
      body: product?.storytellingRoast?.value || '',
      image:
        getMetafieldImage(product?.storytellingRoastImage) || fallbackImage,
      kicker: 'Roasted with intention',
    },
    {
      id: 'brew',
      eyebrow: 'Brew',
      title: 'How to brew it at home',
      body: product?.storytellingBrew?.value || '',
      image:
        getMetafieldImage(product?.storytellingBrewImage) || fallbackImage,
      kicker: 'Brew with confidence',
    },
  ];

  return possibleSteps.filter((step) => hasValue(step.body));
}

function StorytellingVisual({step, topClassName = ''}) {
  return (
    <div className={topClassName}>
      <div className="h-full border border-border bg-background overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{opacity: 0, y: 24}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -24}}
            transition={{duration: 0.45}}
            className="h-full flex flex-col"
          >
            <div className="relative h-full bg-secondary overflow-hidden">
              {step.image?.url ? (
                <motion.img
                  key={step.image.url}
                  src={step.image.url}
                  alt={step.image.altText || step.title}
                  initial={{scale: 1.04, y: 6, opacity: 0.96}}
                  animate={{scale: 1, y: 0, opacity: 1}}
                  exit={{scale: 1.02, y: -4, opacity: 0.95}}
                  transition={{duration: 0.8, ease: [0.22, 1, 0.36, 1]}}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : null}

              <div className="absolute inset-x-0 bottom-0 h-[28%] bg-gradient-to-t from-white via-white/95 via-white/70 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 px-6 pt-16 pb-8 text-black">
                <p className="text-[0.65rem] uppercase tracking-[0.25em] mb-2 text-black/60">
                  {step.eyebrow}
                </p>

                <h3 className="font-serif text-2xl md:text-3xl">
                  {step.title}
                </h3>

                <p className="text-[0.7rem] uppercase tracking-[0.2em] mt-3 text-black/70">
                  {step.kicker}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function ProductStorytelling({product, activeImage}) {
  const stepRefs = useRef([]);

  const steps = useMemo(
    () => getStorySteps(product, activeImage),
    [product, activeImage],
  );

  const [activeStepId, setActiveStepId] = useState(steps[0]?.id || '');

  useEffect(() => {
    if (!steps.length) return;

    const activeStillExists = steps.some((step) => step.id === activeStepId);

    if (!activeStillExists) {
      setActiveStepId(steps[0].id);
    }
  }, [steps, activeStepId]);

  useEffect(() => {
    if (!steps.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries[0]?.target?.id) {
          setActiveStepId(visibleEntries[0].target.id);
        }
      },
      {
        threshold: [0.25, 0.5, 0.75],
        rootMargin: '-20% 0px -20% 0px',
      },
    );

    stepRefs.current.forEach((element) => {
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [steps]);

  if (!steps.length) return null;

  const activeStep = steps.find((step) => step.id === activeStepId) || steps[0];

  return (
    <section className="mt-28 lg:mt-36">
      {/* Section header */}
      <div className="mb-10 max-w-2xl">
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">
          Why this coffee
        </p>
        <h2 className="font-serif text-3xl md:text-4xl leading-tight">
          The story behind the cup.
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
        <div className="lg:hidden sticky top-24 z-20 mb-2 h-[42svh] max-h-[32rem] min-h-[20rem] bg-background">
          <StorytellingVisual step={activeStep} topClassName="h-full" />
        </div>

        {/* LEFT: Sticky visual panel */}
        <div className="hidden lg:block lg:sticky lg:top-28 lg:h-[calc(100vh-8rem)]">
          <StorytellingVisual step={activeStep} topClassName="h-full" />
        </div>

        {/* RIGHT: Scroll steps */}
        <div className="space-y-10 md:space-y-12 lg:space-y-0">
          {steps.map((step, index) => {
            const isActive = activeStepId === step.id;

            return (
              <article
                key={step.id}
                id={step.id}
                ref={(element) => {
                  stepRefs.current[index] = element;
                }}
                className="min-h-[46vh] md:min-h-[52vh] lg:min-h-[80vh] flex items-center"
              >
                <div className="max-w-xl">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
                    {String(index + 1).padStart(2, '0')} / {step.eyebrow}
                  </p>

                  <h3
                    className={`font-serif text-3xl md:text-5xl leading-tight transition-opacity duration-300 ${
                      isActive ? 'opacity-100' : 'opacity-60'
                    }`}
                  >
                    {step.title}
                  </h3>

                  <p
                    className={`mt-5 text-base md:text-lg leading-relaxed whitespace-pre-line transition-opacity duration-300 ${
                      isActive ? 'opacity-100' : 'opacity-65'
                    }`}
                  >
                    {step.body}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}