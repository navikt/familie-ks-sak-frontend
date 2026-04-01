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

const gruppeIdTilSuperbrukerRolle = erProd()
    ? 'b8158d87-a284-4620-9bf9-f0aa3f62c8aa'
    : '314fa714-f13c-4cdc-ac5c-e13ce08e241c';

export class Saksbehandler {
    readonly displayName: string;
    readonly email: string;
    readonly firstName: string;
    readonly groups: readonly string[];
    readonly identifier: string;
    readonly lastName: string;
    readonly enhet: string;
    readonly navIdent: string;

    constructor(data: {
        displayName: string;
        email: string;
        firstName: string;
        groups?: string[];
        identifier: string;
        lastName: string;
        enhet: string;
        navIdent: string;
    }) {
        this.displayName = data.displayName;
        this.email = data.email;
        this.firstName = data.firstName;
        this.groups = [...(data.groups ?? [])];
        this.identifier = data.identifier;
        this.lastName = data.lastName;
        this.enhet = data.enhet;
        this.navIdent = data.navIdent;
    }

    public hentRolle(): BehandlerRolle {
        let rolle = BehandlerRolle.UKJENT;
        this.groups.forEach(id => {
            rolle = rolle < gruppeIdTilRolle(id) ? gruppeIdTilRolle(id) : rolle;
        });
        if (rolle === BehandlerRolle.UKJENT) {
            throw new Error('Finner ikke rolle til saksbehandler.');
        }
        return rolle;
    }

    public harSuperbrukerTilgang() {
        return this.groups.includes(gruppeIdTilSuperbrukerRolle);
    }

    public harSkrivetilgang() {
        const rolle = this.hentRolle();
        return rolle >= BehandlerRolle.SAKSBEHANDLER;
    }

    public mapTilISaksbehandler(): ISaksbehandler {
        return {
            displayName: this.displayName,
            email: this.email,
            firstName: this.firstName,
            groups: [...this.groups],
            identifier: this.identifier,
            lastName: this.lastName,
            enhet: this.enhet,
            navIdent: this.navIdent,
        };
    }
}
