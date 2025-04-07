export interface IToggles {
    [name: string]: boolean;
}

export enum ToggleNavn {
    kanBehandleTekniskEndring = 'familie-ks-sak.behandling.teknisk-endring',
    kanManueltKorrigereMedVedtaksbrev = 'familie-ks-sak.behandling.korreksjon-vedtaksbrev',
    tekniskVedlikeholdHenleggelse = 'familie-ks-sak.teknisk-vedlikehold-henleggelse.tilgangsstyring',
    kanBehandleKlage = 'familie-ks-sak.klage',
    kanOppretteOgEndreSammensatteKontrollsaker = 'familie-ks-sak.kan-opprette-og-endre-sammensatte-kontrollsaker',
    skalObfuskereData = 'familie-ks-sak.anonymiser-persondata',
    kanOppretteRevurderingMedAarsakIverksetteKaVedtak = 'familie-ks-sak.kan-opprette-revurdering-med-aarsak-iverksette-ka-vedtak',
    skalAlltidViseAlleVedtaksperioder = 'familie-ks-sak-frontend.alltid-vis-alle-vedtaksperioder',
    innhenteOpplysningerKlageBrev = 'familie-ks-sak.innhente-opplysninger-klage-brev',
}

export const alleTogglerAv = (): IToggles => {
    return Object.values(ToggleNavn).reduce((previousValue: IToggles, currentValue: ToggleNavn) => {
        previousValue[currentValue] = false;
        return previousValue;
    }, {});
};
