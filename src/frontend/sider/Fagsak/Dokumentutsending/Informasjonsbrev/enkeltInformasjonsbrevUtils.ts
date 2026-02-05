import type { SkjemaBrevmottaker } from '../../../../komponenter/Saklinje/Meny/LeggTilEllerFjernBrevmottakere/useBrevmottakerSkjema';
import type { IManueltBrevRequestPåFagsak } from '../../../../typer/dokument';
import type { IPersonInfo } from '../../../../typer/person';
import type { Målform } from '../../../../typer/søknad';
import type { Informasjonsbrev } from '../../Behandling/Høyremeny/Brev/typer';

interface IHentEnkeltInformasjonsbrevRequestInput {
    bruker: IPersonInfo;
    målform: Målform;
    brevmal: Informasjonsbrev;
    manuelleBrevmottakerePåFagsak: SkjemaBrevmottaker[];
}

export const hentEnkeltInformasjonsbrevRequest = ({
    bruker,
    målform,
    brevmal,
    manuelleBrevmottakerePåFagsak,
}: IHentEnkeltInformasjonsbrevRequestInput): IManueltBrevRequestPåFagsak => {
    return {
        mottakerIdent: bruker.personIdent,
        multiselectVerdier: [],
        barnIBrev: [],
        mottakerMålform: målform,
        mottakerNavn: bruker.navn,
        brevmal: brevmal,
        manuelleBrevmottakere: manuelleBrevmottakerePåFagsak,
    };
};
