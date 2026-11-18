function fagsakMutationKey(fagsakId: number) {
    return ['fagsak', fagsakId] as const;
}

function behandlingMutationKey(behandlingId: number) {
    return ['behandling', behandlingId] as const;
}

function vedtaksperiodeMutationKey(vedtaksperiodeId: number) {
    return ['vedtaksperiode', vedtaksperiodeId] as const;
}

function endretUtbetalingAndelMutationKey(endretUtbetalingAndelId: number | undefined) {
    return ['endret-utbetaling-andel', endretUtbetalingAndelId] as const;
}

export const mutationKeys = {
    // Frittstående
    hentFagsakPaaPerson: () => {
        return ['hent-fagsak-pa-person'] as const;
    },
    opprettEllerHentFagsak: () => {
        return ['opprett-eller-hent-fagsak'] as const;
    },
    slettBrevmottaker: () => {
        return ['slett-brevmottaker'] as const;
    },
    slettVilkårResultat: () => {
        return ['slett-vilkar-resultat'] as const;
    },
    opprettForhåndsvisbarTilbakekrevingVarselbrevPdf: () => {
        return ['opprett-forhandsvisbar-tilbakekreving-varselbrev-pdf'] as const;
    },

    // Fagsak
    forhåndsvisBrevPåFagsak: (fagsakId: number) => {
        return [...fagsakMutationKey(fagsakId), 'forhandsvis-brev'] as const;
    },
    sendInformasjonsbrev: (fagsakId: number) => {
        return [...fagsakMutationKey(fagsakId), 'send-informasjonsbrev'] as const;
    },
    låsOppFagsak: (fagsakId: number) => {
        return [...fagsakMutationKey(fagsakId), 'las-opp'] as const;
    },

    // Behandling
    sendBehandlingBrev: (behandlingId: number) => {
        return [...behandlingMutationKey(behandlingId), 'send-brev'] as const;
    },
    opprettSammensattKontrollsak: (behandlingId: number) => {
        return [...behandlingMutationKey(behandlingId), 'sammensatt-kontrollsak', 'opprett'] as const;
    },
    slettSammensattKontrollsak: (behandlingId: number) => {
        return [...behandlingMutationKey(behandlingId), 'sammensatt-kontrollsak', 'slett'] as const;
    },

    // Vedtaksperiode
    oppdaterVedtaksperiodeMedBegrunnelser: (vedtaksperiodeId: number) => {
        return [...vedtaksperiodeMutationKey(vedtaksperiodeId), 'oppdater-begrunnelser'] as const;
    },
    oppdaterVedtaksperiodeMedFritekster: (vedtaksperiodeId: number) => {
        return [...vedtaksperiodeMutationKey(vedtaksperiodeId), 'oppdater-fritekster'] as const;
    },

    // Endret utbetaling
    oppdaterEndretUtbetalingAndel: (endretUtbetalingAndelId: number | undefined) => {
        return [...endretUtbetalingAndelMutationKey(endretUtbetalingAndelId), 'oppdater'] as const;
    },
    slettEndretUtbetalingAndel: (endretUtbetalingAndelId: number | undefined) => {
        return [...endretUtbetalingAndelMutationKey(endretUtbetalingAndelId), 'slett'] as const;
    },

    // Refusjon EØS
    slettRefusjonEøs: (refusjonEøsId: number) => {
        return ['refusjon-eos', refusjonEøsId, 'slett'] as const;
    },

    // Feilutbetalt valuta
    slettFeilutbetaltValuta: (feilutbetaltValutaId: number) => {
        return ['feilutbetalt-valuta', feilutbetaltValutaId, 'slett'] as const;
    },
};
