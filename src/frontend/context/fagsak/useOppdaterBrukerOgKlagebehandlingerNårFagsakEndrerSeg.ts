import { useEffect } from 'react';

import type { Ressurs } from '@navikt/familie-typer';

import type { IMinimalFagsak } from '../../typer/fagsak';
import type { IPersonInfo } from '../../typer/person';

interface Props {
    fagsak: IMinimalFagsak;
    oppdaterBrukerHvisFagsakEndres: (
        bruker: Ressurs<IPersonInfo>,
        søkerFødselsnummer?: string
    ) => void;
    bruker: Ressurs<IPersonInfo>;
    oppdaterKlagebehandlingerPåFagsak: () => void;
    oppdaterTilbakekrevingsbehandlingerPåFagsak: () => void;
}

export const useOppdaterBrukerOgEksterneBehandlingerNårFagsakEndrerSeg = ({
    fagsak,
    oppdaterBrukerHvisFagsakEndres,
    bruker,
    oppdaterKlagebehandlingerPåFagsak,
    oppdaterTilbakekrevingsbehandlingerPåFagsak,
}: Props) =>
    useEffect(() => {
        oppdaterBrukerHvisFagsakEndres(bruker, fagsak?.søkerFødselsnummer);
        oppdaterKlagebehandlingerPåFagsak();
        oppdaterTilbakekrevingsbehandlingerPåFagsak();
    }, [fagsak]);
