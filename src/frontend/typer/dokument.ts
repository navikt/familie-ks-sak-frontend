import type { BehandlingKategori } from './behandlingstema';
import type { Målform } from './søknad';
import type { SkjemaBrevmottaker } from '../komponenter/Fagsak/Personlinje/Behandlingsmeny/LeggTilEllerFjernBrevmottakere/useBrevmottakerSkjema';
import type {
    Brevmal,
    Informasjonsbrev,
} from '../komponenter/Felleskomponenter/Hendelsesoversikt/BrevModul/typer';

export interface IManueltBrevRequestPåBehandling {
    mottakerIdent: string;
    multiselectVerdier: string[];
    barnIBrev: string[];
    brevmal: Brevmal;
    barnasFødselsdager?: string[];
    behandlingKategori?: BehandlingKategori | undefined;
    antallUkerSvarfrist?: number;
    fritekstAvsnitt?: string;
}

export interface IManueltBrevRequestPåFagsak {
    mottakerIdent: string;
    multiselectVerdier: string[];
    barnIBrev: string[];
    mottakerMålform: Målform;
    mottakerNavn: string;
    brevmal: Brevmal | Informasjonsbrev;
    behandlingKategori?: undefined;
    antallUkerSvarfrist?: undefined;
    manuelleBrevmottakere: SkjemaBrevmottaker[];
}
