import type { BarnehagebarnRequestParams } from '@typer/barnehagebarn';
import type { FagsakId } from '@typer/fagsak';

function personQueryKey(ident: string | undefined) {
    return ['person', ident] as const;
}

function fagsakQueryKey(fagsakId: FagsakId | undefined) {
    return ['fagsak', fagsakId] as const;
}

function behandlingQueryKey(behandlingId: number | undefined) {
    return ['behandling', behandlingId] as const;
}

function vedtaksperioderQueryKey(behandlingId: number) {
    return [...behandlingQueryKey(behandlingId), 'vedtaksperioder'] as const;
}

export const queryKeys = {
    // Frittstående
    alleBegrunnelser: () => {
        return ['alle-begrunnelser'] as const;
    },
    endretUtbetalingBegrunnelser: () => {
        return ['endret-utbetaling-begrunnelser'] as const;
    },
    bydeler: () => {
        return ['bydeler'] as const;
    },
    barnehagebarn: (barnehagebarnRequestParams: BarnehagebarnRequestParams) => {
        return ['barnehagebarn', barnehagebarnRequestParams] as const;
    },
    featureToggles: () => {
        return ['feature-toggles'] as const;
    },
    saksbehandler: () => {
        return ['saksbehandler'] as const;
    },
    versjonsinfoFrontend: () => {
        return ['versjonsinfo', 'frontend'] as const;
    },
    versjonsinfoBackend: () => {
        return ['versjonsinfo', 'backend'] as const;
    },

    // Person
    person: personQueryKey,
    personEnkel: (ident: string) => {
        return ['person-enkel', ident] as const;
    },

    // Fagsak
    fagsak: fagsakQueryKey,
    kontantstøttebehandlinger: (fagsakId: FagsakId) => {
        return [...fagsakQueryKey(fagsakId), 'kontantstottebehandlinger'] as const;
    },
    harÅpenTilbakekreving: (fagsakId: FagsakId) => {
        return [...fagsakQueryKey(fagsakId), 'har-apen-tilbakekreving'] as const;
    },
    klagebehandlinger: (fagsakId: FagsakId) => {
        return [...fagsakQueryKey(fagsakId), 'klagebehandlinger'] as const;
    },
    tilbakekrevingsbehandlinger: (fagsakId: FagsakId) => {
        return [...fagsakQueryKey(fagsakId), 'tilbakekrevingsbehandlinger'] as const;
    },

    // Behandling
    behandling: behandlingQueryKey,
    feilutbetaltValuta: (behandlingId: number) => {
        return [...behandlingQueryKey(behandlingId), 'feilutbetalt-valuta'] as const;
    },
    historikkinnslag: (behandlingId: number) => {
        return [...behandlingQueryKey(behandlingId), 'historikkinnslag'] as const;
    },
    korrigertEtterbetaling: (behandlingId: number) => {
        return [...behandlingQueryKey(behandlingId), 'korrigert-etterbetaling'] as const;
    },
    korrigertVedtak: (behandlingId: number) => {
        return [...behandlingQueryKey(behandlingId), 'korrigert-vedtak'] as const;
    },
    personerMedUgyldigEtterbetalingsperiode: (behandlingId: number) => {
        return [...behandlingQueryKey(behandlingId), 'personer-med-ugyldig-etterbetalingsperiode'] as const;
    },
    refusjonEøs: (behandlingId: number) => {
        return [...behandlingQueryKey(behandlingId), 'refusjon-eos'] as const;
    },
    sammensattKontrollsak: (behandlingId: number) => {
        return [...behandlingQueryKey(behandlingId), 'sammensatt-kontrollsak'] as const;
    },
    simulering: (behandlingId: number) => {
        return [...behandlingQueryKey(behandlingId), 'simulering'] as const;
    },
    tilbakekreving: (behandlingId: number) => {
        return [...behandlingQueryKey(behandlingId), 'tilbakekreving'] as const;
    },

    // Vedtaksperioder
    vedtaksperioder: vedtaksperioderQueryKey,
    genererteBrevbegrunnelser: (behandlingId: number, vedtaksperiodeId: number) => {
        return [...vedtaksperioderQueryKey(behandlingId), vedtaksperiodeId, 'genererte-brevbegrunnelser'] as const;
    },
};
