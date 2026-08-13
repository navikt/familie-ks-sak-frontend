import { BehandlingStatus, Behandlingstype, erBehandlingHenlagt, type IBehandling } from '@typer/behandling';
import { FagsakStatus, type IMinimalFagsak } from '@typer/fagsak';
import { FeatureToggle, type FeatureToggles } from '@typer/featureToggles';
import { Klagebehandlingstype } from '@typer/klage';
import type { IGrunnlagPerson } from '@typer/person';
import { PersonType } from '@typer/person';
import { Målform } from '@typer/søknad';
import { Tilbakekrevingsbehandlingstype } from '@typer/tilbakekrevingsbehandling';
import { hentAktivBehandlingPåMinimalFagsak } from '@utils/fagsak';

export const hentSøkersMålform = (behandling: IBehandling) =>
    behandling.personer.find((person: IGrunnlagPerson) => {
        return person.type === PersonType.SØKER;
    })?.målform ?? Målform.NB;

export const MIDLERTIDIG_BEHANDLENDE_ENHET_ID = '4863';

const TILGJENGELIGE_BEHANDLINGSTYPER = [
    Behandlingstype.FØRSTEGANGSBEHANDLING,
    Behandlingstype.REVURDERING,
    Behandlingstype.TEKNISK_ENDRING,
    Tilbakekrevingsbehandlingstype.TILBAKEKREVING,
    Klagebehandlingstype.KLAGE,
];

export function hentTilgjengeligeBehandlingstyper(fagsak: IMinimalFagsak, toggles: FeatureToggles) {
    const behandling = hentAktivBehandlingPåMinimalFagsak(fagsak);
    const alleBehandlingerErHenlagt = fagsak.behandlinger.every(behandling => erBehandlingHenlagt(behandling.resultat));

    const kanOppretteNyBehandling = !behandling || behandling?.status === BehandlingStatus.AVSLUTTET;
    const kanOppretteFørstegangsbehandling = fagsak.status !== FagsakStatus.LØPENDE && kanOppretteNyBehandling;
    const kanOppretteRevurdering = !alleBehandlingerErHenlagt && kanOppretteNyBehandling;
    const kanOppretteTekniskEndring = kanOppretteRevurdering && toggles[FeatureToggle.kanBehandleTekniskEndring];
    const kanOppretteKlagebehandling = !fagsak.finnesStrengtFortroligPersonIFagsak;

    return TILGJENGELIGE_BEHANDLINGSTYPER.filter(
        type =>
            (kanOppretteFørstegangsbehandling && type === Behandlingstype.FØRSTEGANGSBEHANDLING) ||
            (kanOppretteRevurdering && type === Behandlingstype.REVURDERING) ||
            (kanOppretteTekniskEndring && type === Behandlingstype.TEKNISK_ENDRING) ||
            type === Tilbakekrevingsbehandlingstype.TILBAKEKREVING ||
            (kanOppretteKlagebehandling && type === Klagebehandlingstype.KLAGE)
    );
}
