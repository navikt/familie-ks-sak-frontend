import {
    BehandlingStatus,
    Behandlingstype,
    BehandlingÅrsak,
    behandlingÅrsakerSomIkkeSkalSettesManuelt,
    erBehandlingHenlagt,
    type IBehandling,
} from '@typer/behandling';
import { FagsakStatus, type IMinimalFagsak } from '@typer/fagsak';
import { FeatureToggle, type FeatureToggles } from '@typer/featureToggles';
import { Klagebehandlingstype } from '@typer/klage';
import type { IGrunnlagPerson } from '@typer/person';
import { PersonType } from '@typer/person';
import { Målform } from '@typer/søknad';
import { Tilbakekrevingsbehandlingstype } from '@typer/tilbakekrevingsbehandling';
import { erFagsakLåst, hentAktivBehandlingPåMinimalFagsak } from '@utils/fagsak';

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

export function hentTilgjengeligeBehandlingstyper(
    fagsak: IMinimalFagsak | undefined,
    toggles: FeatureToggles,
    erManuellJournalføring?: boolean
) {
    const behandling = fagsak ? hentAktivBehandlingPåMinimalFagsak(fagsak) : undefined;
    const harIkkeAktivBehandling = !behandling || behandling?.status === BehandlingStatus.AVSLUTTET;
    const alleBehandlingerErHenlagt = fagsak?.behandlinger.every(behandling =>
        erBehandlingHenlagt(behandling.resultat)
    );

    const kanOppretteFørstegangsbehandling =
        fagsak === undefined ||
        (!erFagsakLåst(fagsak) && fagsak.status !== FagsakStatus.LØPENDE && harIkkeAktivBehandling);
    const kanOppretteRevurdering =
        fagsak !== undefined && !erFagsakLåst(fagsak) && !alleBehandlingerErHenlagt && harIkkeAktivBehandling;
    const kanOppretteTekniskEndring = kanOppretteRevurdering && toggles[FeatureToggle.kanBehandleTekniskEndring];
    const kanOppretteKlagebehandling = fagsak !== undefined && !fagsak.finnesStrengtFortroligPersonIFagsak;
    const kanOppretteTilbakekreving = !erManuellJournalføring;

    return TILGJENGELIGE_BEHANDLINGSTYPER.filter(
        type =>
            (kanOppretteFørstegangsbehandling && type === Behandlingstype.FØRSTEGANGSBEHANDLING) ||
            (kanOppretteRevurdering && type === Behandlingstype.REVURDERING) ||
            (kanOppretteTekniskEndring && type === Behandlingstype.TEKNISK_ENDRING) ||
            (kanOppretteTilbakekreving && type === Tilbakekrevingsbehandlingstype.TILBAKEKREVING) ||
            (kanOppretteKlagebehandling && type === Klagebehandlingstype.KLAGE)
    );
}

export function hentTilgjengeligeBehandlingsårsaker() {
    return Object.values(BehandlingÅrsak).filter(årsak => !behandlingÅrsakerSomIkkeSkalSettesManuelt().includes(årsak));
}
