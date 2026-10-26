import type { Brevmottaker } from '@typer/brevmottaker';
import type { Brevmal, Informasjonsbrev } from '../sider/Fagsak/Behandling/Høyremeny/Brev/typer';
import type { BehandlingKategori } from './behandlingstema';
import type { Målform } from './søknad';

export interface IManueltBrevRequestPåBehandling {
    mottakerIdent: string;
    multiselectVerdier: string[];
    barnIBrev: string[];
    brevmal: Brevmal;
    barnasFødselsdager?: string[];
    behandlingKategori?: BehandlingKategori | undefined;
    antallUkerSvarfrist?: number;
    fritekstAvsnitt?: string;
    mottakerlandSed?: string[];
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
    manuelleBrevmottakere: Brevmottaker[];
    fritekstAvsnitt?: string;
    mottakerlandSed?: undefined;
}
