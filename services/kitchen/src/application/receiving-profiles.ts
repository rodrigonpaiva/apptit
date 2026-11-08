import type { ReceivingObservationProfile, Scope } from '@apptit/contracts';
/** Engineering examples only. No source is a law, validated PMS or restaurant activation. */
export function receivingFixtureProfiles(scope: Scope): ReceivingObservationProfile[] {
  const common = { version: 1, scope, stage: 'receiving' as const, synthetic: true as const, validatedForOperation: false as const, sourceRef: 'fixture/SP2-05/engineering-example-not-operational', condition: { required: true as const, expected: 'intact' as const, requireMethod: true as const }, maxAgeSeconds: 3600, futureToleranceSeconds: 30 };
  return [
    { ...structuredClone(common), id: 'fixture-chilled-receiving', category: 'synthetic_chilled', name: 'Illustration réfrigéré — non validée', temperature: { required: true, unit: 'Cel', minimum: '2', maximum: '8', requireMethod: true, requireInstrument: true } },
    { ...structuredClone(common), id: 'fixture-frozen-receiving', category: 'synthetic_frozen', name: 'Illustration surgelé — non validée', temperature: { required: true, unit: 'Cel', minimum: '-25', maximum: '-12', requireMethod: true, requireInstrument: true } },
    { ...structuredClone(common), id: 'fixture-ambient-receiving', category: 'synthetic_ambient', name: 'Illustration ambiant — non validée', temperature: { required: false, unit: 'Cel', minimum: '2', maximum: '8', requireMethod: true, requireInstrument: false } },
  ];
}
