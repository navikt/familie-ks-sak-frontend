import type { IBehandling } from '../typer/behandling';
import type { IGrunnlagPerson } from '../typer/person';
import { PersonType } from '../typer/person';
import { Målform } from '../typer/søknad';

export const hentSøkersMålform = (behandling: IBehandling) =>
    behandling.personer.find((person: IGrunnlagPerson) => {
        return person.type === PersonType.SØKER;
    })?.målform ?? Målform.NB;

export const MIDLERTIDIG_BEHANDLENDE_ENHET_ID = '4863';
