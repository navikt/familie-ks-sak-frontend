export interface IToggles {
    [name: string]: boolean;
}

export enum ToggleNavn {
    kanBehandleTekniskEndring = 'familie-ks-sak.behandling.teknisk-endring',
    kanManueltKorrigereMedVedtaksbrev = 'familie-ks-sak.behandling.korreksjon-vedtaksbrev',
    tekniskVedlikeholdHenleggelse = 'familie-ks-sak.teknisk-vedlikehold-henleggelse.tilgangsstyring',
    kanBehandleKlage = 'familie-ks-sak.klage',
    lovendring7MndNyeBehandlinger = 'familie-ks-sak.lov-endring-7-mnd-nye-behandlinger',
    kanOppretteOgEndreSammensatteKontrollsaker = 'familie-ks-sak.kan-opprette-og-endre-sammensatte-kontrollsaker',
    skalObfuskereData = 'familie-ks-sak.anonymiser-persondata',
    overgangsordningErTilgjengelig = 'familie-ks-sak.overgangsordning',
}

export const alleTogglerAv = (): IToggles => {
    return Object.values(ToggleNavn).reduce((previousValue: IToggles, currentValue: ToggleNavn) => {
        previousValue[currentValue] = false;
        return previousValue;
    }, {});
};
