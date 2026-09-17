import { BehandlingKategori } from '@typer/behandlingstema';
import { describe, expect, test } from 'vitest';

import {
    erBrevmalMedObligatoriskFritekstKulepunkt,
    skalViseAntallUkerSvarfrist,
    skalViseBarnBrevetGjelder,
    skalViseDokumenter,
    skalViseFritekstAvsnitt,
    skalViseFritekstKulepunkter,
    skalViseMottakerlandSed,
} from './brevmalRegler';
import { Brevmal } from './typer';

describe('skalViseFritekstKulepunkter', () => {
    test('er false når ingen brevmal er valgt', () => {
        expect(skalViseFritekstKulepunkter('')).toBe(false);
    });

    test('er false for brevmaler uten fritekstkulepunkter', () => {
        expect(skalViseFritekstKulepunkter(Brevmal.SVARTIDSBREV)).toBe(false);
        expect(skalViseFritekstKulepunkter(Brevmal.UTBETALING_ETTER_KA_VEDTAK)).toBe(false);
    });

    test('er true for øvrige brevmaler', () => {
        expect(skalViseFritekstKulepunkter(Brevmal.INNHENTE_OPPLYSNINGER)).toBe(true);
        expect(skalViseFritekstKulepunkter(Brevmal.VARSEL_OM_REVURDERING)).toBe(true);
    });
});

describe('skalViseFritekstAvsnitt', () => {
    test('er false når ingen brevmal er valgt', () => {
        expect(skalViseFritekstAvsnitt('')).toBe(false);
    });

    test('er true for brevmaler med fritekstavsnitt', () => {
        expect(skalViseFritekstAvsnitt(Brevmal.UTBETALING_ETTER_KA_VEDTAK)).toBe(true);
    });

    test('er false for brevmaler uten fritekstavsnitt', () => {
        expect(skalViseFritekstAvsnitt(Brevmal.SVARTIDSBREV)).toBe(false);
        expect(skalViseFritekstAvsnitt(Brevmal.INNHENTE_OPPLYSNINGER)).toBe(false);
    });
});

describe('skalViseAntallUkerSvarfrist', () => {
    test('er true kun for forlenget svartidsbrev', () => {
        expect(skalViseAntallUkerSvarfrist(Brevmal.FORLENGET_SVARTIDSBREV)).toBe(true);
        expect(skalViseAntallUkerSvarfrist(Brevmal.SVARTIDSBREV)).toBe(false);
        expect(skalViseAntallUkerSvarfrist('')).toBe(false);
    });
});

describe('skalViseDokumenter', () => {
    test('er true for brevmaler med dokumentvalg', () => {
        expect(skalViseDokumenter(Brevmal.INNHENTE_OPPLYSNINGER)).toBe(true);
        expect(skalViseDokumenter(Brevmal.INNHENTE_OPPLYSNINGER_ETTER_SØKNAD_I_SED)).toBe(true);
    });

    test('er false for øvrige brevmaler', () => {
        expect(skalViseDokumenter(Brevmal.SVARTIDSBREV)).toBe(false);
        expect(skalViseDokumenter('')).toBe(false);
    });
});

describe('skalViseBarnBrevetGjelder', () => {
    test('er true for brevmaler som gjelder utvalgte barn', () => {
        expect(skalViseBarnBrevetGjelder(Brevmal.INNHENTE_OPPLYSNINGER_ETTER_SØKNAD_I_SED)).toBe(true);
        expect(skalViseBarnBrevetGjelder(Brevmal.VARSEL_ANNEN_FORELDER_MED_SELVSTENDIG_RETT_SØKT)).toBe(true);
    });

    test('er false for øvrige brevmaler', () => {
        expect(skalViseBarnBrevetGjelder(Brevmal.INNHENTE_OPPLYSNINGER)).toBe(false);
        expect(skalViseBarnBrevetGjelder('')).toBe(false);
    });
});

describe('skalViseMottakerlandSed', () => {
    test('vises på svartidsbrev kun for EØS-behandlinger', () => {
        expect(skalViseMottakerlandSed(Brevmal.SVARTIDSBREV, BehandlingKategori.EØS)).toBe(true);
        expect(skalViseMottakerlandSed(Brevmal.SVARTIDSBREV, BehandlingKategori.NASJONAL)).toBe(false);
    });

    test('er false for øvrige brevmaler', () => {
        expect(skalViseMottakerlandSed(Brevmal.INNHENTE_OPPLYSNINGER, BehandlingKategori.EØS)).toBe(false);
        expect(skalViseMottakerlandSed('', BehandlingKategori.EØS)).toBe(false);
    });
});

describe('erBrevmalMedObligatoriskFritekstKulepunkt', () => {
    test('er true for brevmaler med obligatorisk fritekstkulepunkt', () => {
        expect(erBrevmalMedObligatoriskFritekstKulepunkt(Brevmal.VARSEL_OM_REVURDERING)).toBe(true);
        expect(erBrevmalMedObligatoriskFritekstKulepunkt(Brevmal.FORLENGET_SVARTIDSBREV)).toBe(true);
    });

    test('er false for brevmaler uten obligatorisk fritekstkulepunkt', () => {
        expect(erBrevmalMedObligatoriskFritekstKulepunkt(Brevmal.INNHENTE_OPPLYSNINGER)).toBe(false);
        expect(erBrevmalMedObligatoriskFritekstKulepunkt(Brevmal.SVARTIDSBREV)).toBe(false);
    });
});
