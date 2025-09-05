import { useEffect } from 'react';

import type { Ressurs } from '@navikt/familie-typer';
import { byggTomRessurs, hentDataFraRessurs, RessursStatus } from '@navikt/familie-typer';

import type { IMinimalFagsak } from '../../typer/fagsak';
import type { IPersonInfo } from '../../typer/person';

interface Props {
    minimalFagsakRessurs: Ressurs<IMinimalFagsak>;
    settBruker: (ressurs: Ressurs<IPersonInfo>) => void;
    oppdaterBrukerHvisFagsakEndres: (
        bruker: Ressurs<IPersonInfo>,
        søkerFødselsnummer?: string
    ) => void;
    bruker: Ressurs<IPersonInfo>;
    oppdaterKlagebehandlingerPåFagsak: () => void;
    oppdaterTilbakekrevingsbehandlingerPåFagsak: () => void;
}

export const useOppdaterBrukerOgEksterneBehandlingerNårFagsakEndrerSeg = ({
    minimalFagsakRessurs,
    settBruker,
    oppdaterBrukerHvisFagsakEndres,
    bruker,
    oppdaterKlagebehandlingerPåFagsak,
    oppdaterTilbakekrevingsbehandlingerPåFagsak,
}: Props) =>
    useEffect(() => {
        if (
            minimalFagsakRessurs.status !== RessursStatus.SUKSESS &&
            minimalFagsakRessurs.status !== RessursStatus.HENTER
        ) {
            settBruker(byggTomRessurs());
        } else {
            oppdaterBrukerHvisFagsakEndres(
                bruker,
                hentDataFraRessurs(minimalFagsakRessurs)?.søkerFødselsnummer
            );
        }
        oppdaterKlagebehandlingerPåFagsak();
        oppdaterTilbakekrevingsbehandlingerPåFagsak();
    }, [minimalFagsakRessurs]);
