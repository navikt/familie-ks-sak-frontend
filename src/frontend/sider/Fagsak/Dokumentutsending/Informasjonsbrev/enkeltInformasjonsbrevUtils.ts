import type { Informasjonsbrev } from '../../../../komponenter/Hendelsesoversikt/BrevModul/typer';
import type { IManueltBrevRequestPåFagsak } from '../../../../typer/dokument';
import type { IPersonInfo } from '../../../../typer/person';
import type { Målform } from '../../../../typer/søknad';
import type { SkjemaBrevmottaker } from '../../Fagsaklinje/Behandlingsmeny/LeggTilEllerFjernBrevmottakere/useBrevmottakerSkjema';

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
