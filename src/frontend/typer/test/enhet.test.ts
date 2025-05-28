import { enhetsgrupper, harTilgangTilEnhet } from '../enhet';

describe('Enhet typer', () => {
    test('Skal sjekke tilgangsstyring på enheter', () => {
        expect(
            harTilgangTilEnhet('4806', ['0d746128-7cb0-431b-9420-885e7a75260f'], () => false)
        ).toBe(true);
        expect(harTilgangTilEnhet('4806', [], () => false)).toBe(false);
    });

    test('Skal sjekke at man har tilgang til alle enheter i non-prod', () => {
        Object.values(enhetsgrupper).forEach(enhet => {
            expect(harTilgangTilEnhet(enhet, [])).toBe(true);
        });
    });
});
