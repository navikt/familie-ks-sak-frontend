export interface IToggles {
    [name: string]: boolean;
}

export enum ToggleNavn {
    kanBehandleTekniskEndring = 'familie-ks-sak.behandling.teknisk-endring',
    kanManueltKorrigereMedVedtaksbrev = 'familie-ks-sak.behandling.korreksjon-vedtaksbrev',
    tekniskVedlikeholdHenleggelse = 'familie-ks-sak.teknisk-vedlikehold-henleggelse.tilgangsstyring',
    kanBehandleKlage = 'familie-ks-sak.klage',
}

export const alleTogglerAv = (): IToggles => {
    return Object.values(ToggleNavn).reduce((previousValue: IToggles, currentValue: ToggleNavn) => {
        previousValue[currentValue] = false;
        return previousValue;
    }, {});
};
