export interface FeatureToggles {
    [name: string]: boolean;
}

export enum FeatureToggle {
    kanBehandleTekniskEndring = 'familie-ks-sak.behandling.teknisk-endring',
    kanManueltKorrigereMedVedtaksbrev = 'familie-ks-sak.behandling.korreksjon-vedtaksbrev',
    tekniskVedlikeholdHenleggelse = 'familie-ks-sak.teknisk-vedlikehold-henleggelse.tilgangsstyring',
    kanOppretteOgEndreSammensatteKontrollsaker = 'familie-ks-sak.kan-opprette-og-endre-sammensatte-kontrollsaker',
    skalObfuskereData = 'familie-ks-sak.anonymiser-persondata',
    kanOppretteRevurderingMedAarsakIverksetteKaVedtak = 'familie-ks-sak.kan-opprette-revurdering-med-aarsak-iverksette-ka-vedtak',
    skalAlltidViseAlleVedtaksperioder = 'familie-ks-sak-frontend.alltid-vis-alle-vedtaksperioder',
    skalViseOppholdsadresse = 'familie-ks-sak.skal-vise-oppholdsadresse',
}
