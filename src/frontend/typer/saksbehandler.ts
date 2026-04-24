import type { ISaksbehandler } from '@navikt/familie-typer';

import { BehandlerRolle } from './behandling';
import { erProd } from '../utils/miljø';

function gruppeIdTilRolle(gruppeId: string) {
    const rolleConfig = erProd()
        ? new Map([
              ['54cd86b8-2e23-48b2-8852-b05b5827bb0f', BehandlerRolle.VEILEDER],
              ['e40090eb-c2fb-400e-b412-e9084019a73b', BehandlerRolle.SAKSBEHANDLER],
              ['4e7f23d9-5db1-45c0-acec-89c86a9ec678', BehandlerRolle.BESLUTTER],
          ])
        : new Map([
              ['71f503a2-c28f-4394-a05a-8da263ceca4a', BehandlerRolle.VEILEDER],
              ['c7e0b108-7ae6-432c-9ab4-946174c240c0', BehandlerRolle.SAKSBEHANDLER],
              ['52fe1bef-224f-49df-a40a-29f92d4520f8', BehandlerRolle.BESLUTTER],
          ]);
    return rolleConfig.get(gruppeId) ?? BehandlerRolle.UKJENT;
}

function hentGruppeIdTilSuperbrukerRolle() {
    return erProd() ? 'b8158d87-a284-4620-9bf9-f0aa3f62c8aa' : '314fa714-f13c-4cdc-ac5c-e13ce08e241c';
}

export interface Saksbehandler extends ISaksbehandler {
    groups: string[];
    rolle: BehandlerRolle;
    harSkrivetilgang: boolean;
    harSuperbrukertilgang: boolean;
}

export function utledBehandlerRolle(iSaksbehandler: ISaksbehandler): BehandlerRolle {
    let rolle = BehandlerRolle.UKJENT;
    const groups = iSaksbehandler.groups ?? [];
    groups.forEach(id => {
        rolle = rolle < gruppeIdTilRolle(id) ? gruppeIdTilRolle(id) : rolle;
    });
    if (rolle === BehandlerRolle.UKJENT) {
        throw new Error('Finner ikke rolle til saksbehandler.');
    }
    return rolle;
}

export function harSuperbrukertilgang(iSaksbehandler: ISaksbehandler) {
    const groups = iSaksbehandler.groups ?? [];
    return groups.includes(hentGruppeIdTilSuperbrukerRolle());
}

export function harSkrivetilgang(iSaksbehandler: ISaksbehandler) {
    const rolle = utledBehandlerRolle(iSaksbehandler);
    return rolle >= BehandlerRolle.SAKSBEHANDLER;
}

export function mapISaksbehandlerTilSaksbehandler(iSaksbehandler: ISaksbehandler): Saksbehandler {
    return {
        ...iSaksbehandler,
        groups: iSaksbehandler.groups ?? [],
        rolle: utledBehandlerRolle(iSaksbehandler),
        harSkrivetilgang: harSkrivetilgang(iSaksbehandler),
        harSuperbrukertilgang: harSuperbrukertilgang(iSaksbehandler),
    };
}
