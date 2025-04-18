import type { BehandlingKategori } from './behandlingstema';
import type { Målform } from './søknad';
import type { Brevmal, Informasjonsbrev } from '../komponenter/Hendelsesoversikt/BrevModul/typer';
import type { SkjemaBrevmottaker } from '../sider/Fagsak/Personlinje/Behandlingsmeny/LeggTilEllerFjernBrevmottakere/useBrevmottakerSkjema';

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
    fritekstAvsnitt?: string;
}
