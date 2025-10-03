import React, { createContext, type PropsWithChildren, useContext } from 'react';

import type { AxiosError } from 'axios';
import deepEqual from 'deep-equal';

import { useHttp } from '@navikt/familie-http';
import type { Ressurs } from '@navikt/familie-typer';
import {
    byggDataRessurs,
    byggFeiletRessurs,
    byggHenterRessurs,
    byggTomRessurs,
    hentDataFraRessurs,
    RessursStatus,
} from '@navikt/familie-typer';

import useFagsakApi from '../../api/useFagsakApi';
import { useAppContext } from '../../context/AppContext';
import { useOppdaterBrukerOgEksterneBehandlingerNårFagsakEndrerSeg } from '../../context/fagsak/useOppdaterBrukerOgKlagebehandlingerNårFagsakEndrerSeg';
import type { IMinimalFagsak } from '../../typer/fagsak';
import type { IPersonInfo } from '../../typer/person';
import { sjekkTilgangTilPerson } from '../../utils/commons';
import { obfuskerFagsak, obfuskerPersonInfo } from '../../utils/obfuskerData';

interface IFagsakContext {
    bruker: Ressurs<IPersonInfo>;
    hentMinimalFagsak: (fagsakId: string | number, påvirkerSystemLaster?: boolean) => void;
    minimalFagsakRessurs: Ressurs<IMinimalFagsak>;
    settMinimalFagsakRessurs: (fagsak: Ressurs<IMinimalFagsak>) => void;
    minimalFagsak: IMinimalFagsak | undefined;
    hentBruker: (personIdent: string) => void;
}

const FagsakContext = createContext<IFagsakContext | undefined>(undefined);

export const FagsakProvider = (props: PropsWithChildren) => {
    const [minimalFagsakRessurs, settMinimalFagsakRessurs] = React.useState<Ressurs<IMinimalFagsak>>(byggTomRessurs());

    const [bruker, settBruker] = React.useState<Ressurs<IPersonInfo>>(byggTomRessurs());

    const { request } = useHttp();
    const { skalObfuskereData } = useAppContext();
    const { hentFagsakForPerson } = useFagsakApi();

    const hentMinimalFagsak = (fagsakId: string | number, påvirkerSystemLaster = true): void => {
        if (påvirkerSystemLaster) {
            settMinimalFagsakRessurs(byggHenterRessurs());
        }

        request<void, IMinimalFagsak>({
            method: 'GET',
            url: `/familie-ks-sak/api/fagsaker/minimal/${fagsakId}`,
            påvirkerSystemLaster,
        })
            .then((hentetFagsak: Ressurs<IMinimalFagsak>) => {
                if (påvirkerSystemLaster || !deepEqual(hentetFagsak, minimalFagsakRessurs)) {
                    if (skalObfuskereData) {
                        obfuskerFagsak(hentetFagsak);
                    }
                    settMinimalFagsakRessurs(hentetFagsak);
                }
            })
            .catch((_error: AxiosError) => {
                settMinimalFagsakRessurs(byggFeiletRessurs('Ukjent ved innhenting av fagsak'));
            });
    };

    const oppdaterBrukerHvisFagsakEndres = (bruker: Ressurs<IPersonInfo>, søkerFødselsnummer?: string): void => {
        if (søkerFødselsnummer === undefined) {
            return;
        }

        if (bruker.status !== RessursStatus.SUKSESS || søkerFødselsnummer !== bruker.data.personIdent) {
            hentBruker(søkerFødselsnummer);
        }
    };

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

    useOppdaterBrukerOgEksterneBehandlingerNårFagsakEndrerSeg({
        minimalFagsakRessurs,
        settBruker,
        oppdaterBrukerHvisFagsakEndres,
        bruker,
    });

    return (
        <FagsakContext.Provider
            value={{
                bruker,
                hentMinimalFagsak,
                minimalFagsakRessurs,
                settMinimalFagsakRessurs,
                minimalFagsak: hentDataFraRessurs(minimalFagsakRessurs),
                hentBruker,
            }}
        >
            {props.children}
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
