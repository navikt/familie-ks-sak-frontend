import type { IBehandling } from '../typer/behandling';
import { BehandlerRolle } from '../typer/behandling';
import type { IGrunnlagPerson } from '../typer/person';
import { PersonType } from '../typer/person';
import { Målform } from '../typer/søknad';
import { erProd } from './miljø';

export const gruppeIdTilRolle = (gruppeId: string) => {
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
};

export const hentSøkersMålform = (behandling: IBehandling) =>
    behandling.personer.find((person: IGrunnlagPerson) => {
        return person.type === PersonType.SØKER;
    })?.målform ?? Målform.NB;

export const MIDLERTIDIG_BEHANDLENDE_ENHET_ID = '4863';
