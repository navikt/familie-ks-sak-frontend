export interface IToggles {
    [name: string]: boolean;
}

export enum ToggleNavn {
    kanBehandleTekniskEndring = 'familie-ks-sak.behandling.teknisk-endring',
    kanManueltKorrigereMedVedtaksbrev = 'familie-ks-sak.behandling.korreksjon-vedtaksbrev',
    brukEøs = 'familie-ks-sak.behandling.eos',
    tekniskVedlikeholdHenleggelse = 'familie-ks-sak.teknisk-vedlikehold-henleggelse.tilgangsstyring',
    endreMottakerEndringsårsaker = 'familie-ks-sak.behandling.endringsperiode.endre-mottaker-aarsaker.utgivelse',
    kanBehandleEøsSekunderland = 'familie-ks-sak.behandling.eos-sekunderland',
    kanBehandleEøsToPrimerland = 'familie-ks-sak.behandling.eos-to-primerland',
    kanBehandleKlage = 'familie-ks-sak.klage',
}

export const alleTogglerAv = (): IToggles => {
    return Object.values(ToggleNavn).reduce((previousValue: IToggles, currentValue: ToggleNavn) => {
        previousValue[currentValue] = false;
        return previousValue;
    }, {});
};
