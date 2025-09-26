import React, { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';

import { useHttp } from '@navikt/familie-http';
import type { Ressurs } from '@navikt/familie-typer';
import {
    byggDataRessurs,
    byggHenterRessurs,
    byggTomRessurs,
    hentDataFraRessurs,
    RessursStatus,
} from '@navikt/familie-typer';

import useFagsakApi from '../../api/useFagsakApi';
import { useTilbakekrevingApi } from '../../api/useTilbakekrevingApi';
import type { IMinimalFagsak } from '../../typer/fagsak';
import type { IKlagebehandling } from '../../typer/klage';
import type { IPersonInfo } from '../../typer/person';
import type { ITilbakekrevingsbehandling } from '../../typer/tilbakekrevingsbehandling';
import { sjekkTilgangTilPerson } from '../../utils/commons';
import { obfuskerPersonInfo } from '../../utils/obfuskerData';
import { useAppContext } from '../AppContext';

interface IFagsakContext {
    bruker: Ressurs<IPersonInfo>;
    fagsak: IMinimalFagsak;
    hentBruker: (personIdent: string) => void;
    klagebehandlinger: IKlagebehandling[];
    klageStatus: RessursStatus;
    oppdaterKlagebehandlingerPåFagsak: () => void;
    tilbakekrevingsbehandlinger: ITilbakekrevingsbehandling[];
    tilbakekrevingStatus: RessursStatus;
}

const FagsakContext = createContext<IFagsakContext | undefined>(undefined);

interface Props extends PropsWithChildren {
    fagsak: IMinimalFagsak;
}

export const FagsakProvider = ({ fagsak, children }: Props) => {
    const [bruker, settBruker] = React.useState<Ressurs<IPersonInfo>>(byggTomRessurs());

    const [klagebehandlinger, settKlagebehandlinger] = useState<Ressurs<IKlagebehandling[]>>(byggTomRessurs());

    const [tilbakekrevingsbehandlinger, settTilbakekrevingsbehandlinger] =
        useState<Ressurs<ITilbakekrevingsbehandling[]>>(byggTomRessurs());

    const { request } = useHttp();
    const { skalObfuskereData } = useAppContext();
    const { hentTilbakekrevingsbehandlinger } = useTilbakekrevingApi();
    const { hentFagsakForPerson } = useFagsakApi();

    const hentBruker = (personIdent: string): void => {
        settBruker(byggHenterRessurs());
        request<{ ident: string }, IPersonInfo>({
            method: 'POST',
            url: '/familie-ks-sak/api/person',
            data: {
                ident: personIdent,
            },
            påvirkerSystemLaster: true,
        }).then((hentetPerson: Ressurs<IPersonInfo>) => {
            const brukerEtterTilgangssjekk = sjekkTilgangTilPerson(hentetPerson);
            if (brukerEtterTilgangssjekk.status === RessursStatus.FEILET) {
                settBruker(sjekkTilgangTilPerson(hentetPerson));
            } else if (brukerEtterTilgangssjekk.status === RessursStatus.SUKSESS) {
                if (skalObfuskereData) {
                    obfuskerPersonInfo(brukerEtterTilgangssjekk);
                }
                const brukerMedFagsakId = brukerEtterTilgangssjekk.data;
                hentFagsakForPerson(personIdent).then((fagsak: Ressurs<IMinimalFagsak>) => {
                    if (fagsak.status === RessursStatus.SUKSESS) {
                        brukerMedFagsakId.fagsakId = fagsak.data.id;
                    }
                    settBruker(sjekkTilgangTilPerson(byggDataRessurs(brukerMedFagsakId)));
                });
            }
        });
    };

    const oppdaterKlagebehandlingerPåFagsak = () => {
        request<void, IKlagebehandling[]>({
            method: 'GET',
            url: `/familie-ks-sak/api/fagsaker/${fagsak.id}/hent-klagebehandlinger`,
            påvirkerSystemLaster: true,
        }).then(klagebehandlingerRessurs => settKlagebehandlinger(klagebehandlingerRessurs));
    };

    const oppdaterTilbakekrevingsbehandlingerPåFagsak = () => {
        hentTilbakekrevingsbehandlinger(fagsak.id).then(tilbakekrevingsbehandlingerRessurs =>
            settTilbakekrevingsbehandlinger(tilbakekrevingsbehandlingerRessurs)
        );
    };

    useEffect(() => {
        hentBruker(fagsak.søkerFødselsnummer);
    }, [fagsak.søkerFødselsnummer]);

    useEffect(() => {
        oppdaterKlagebehandlingerPåFagsak();
        oppdaterTilbakekrevingsbehandlingerPåFagsak();
    }, [fagsak.id]);

    return (
        <FagsakContext.Provider
            value={{
                bruker,
                fagsak,
                hentBruker,
                klagebehandlinger: hentDataFraRessurs(klagebehandlinger) ?? [],
                klageStatus: klagebehandlinger.status,
                oppdaterKlagebehandlingerPåFagsak,
                tilbakekrevingsbehandlinger: hentDataFraRessurs(tilbakekrevingsbehandlinger) ?? [],
                tilbakekrevingStatus: tilbakekrevingsbehandlinger.status,
            }}
        >
            {children}
        </FagsakContext.Provider>
    );
};

export const useFagsakContext = () => {
    const context = useContext(FagsakContext);

    if (context === undefined) {
        throw new Error('useFagsakContext må brukes innenfor en FagsakProvider');
    }

    return context;
};
