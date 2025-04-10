import React, { createContext, useContext, useState, type PropsWithChildren } from 'react';

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

import { useOppdaterBrukerOgEksterneBehandlingerNårFagsakEndrerSeg } from './useOppdaterBrukerOgKlagebehandlingerNårFagsakEndrerSeg';
import { useTilbakekrevingApi } from '../../api/useTilbakekrevingApi';
import type { SkjemaBrevmottaker } from '../../sider/Fagsak/Personlinje/Behandlingsmeny/LeggTilEllerFjernBrevmottakere/useBrevmottakerSkjema';
import useFagsakApi from '../../sider/Fagsak/useFagsakApi';
import type { IMinimalFagsak } from '../../typer/fagsak';
import type { IKlagebehandling } from '../../typer/klage';
import type { IPersonInfo } from '../../typer/person';
import type { ITilbakekrevingsbehandling } from '../../typer/tilbakekrevingsbehandling';
import { sjekkTilgangTilPerson } from '../../utils/commons';
import { obfuskerFagsak, obfuskerPersonInfo } from '../../utils/obfuskerData';
import { useApp } from '../AppContext';

interface IFagsakContext {
    bruker: Ressurs<IPersonInfo>;
    hentMinimalFagsak: (fagsakId: string | number, påvirkerSystemLaster?: boolean) => void;
    minimalFagsakRessurs: Ressurs<IMinimalFagsak>;
    settMinimalFagsakRessurs: (fagsak: Ressurs<IMinimalFagsak>) => void;
    hentBruker: (personIdent: string) => void;
    klagebehandlinger: IKlagebehandling[];
    klageStatus: RessursStatus;
    oppdaterKlagebehandlingerPåFagsak: () => void;
    tilbakekrevingsbehandlinger: ITilbakekrevingsbehandling[];
    tilbakekrevingStatus: RessursStatus;
    manuelleBrevmottakerePåFagsak: SkjemaBrevmottaker[];
    settManuelleBrevmottakerePåFagsak: (brevmottakere: SkjemaBrevmottaker[]) => void;
}

const FagsakContext = createContext<IFagsakContext | undefined>(undefined);

export const FagsakProvider = (props: PropsWithChildren) => {
    const [minimalFagsakRessurs, settMinimalFagsakRessurs] =
        React.useState<Ressurs<IMinimalFagsak>>(byggTomRessurs());

    const [bruker, settBruker] = React.useState<Ressurs<IPersonInfo>>(byggTomRessurs());

    const [klagebehandlinger, settKlagebehandlinger] =
        useState<Ressurs<IKlagebehandling[]>>(byggTomRessurs());

    const [tilbakekrevingsbehandlinger, settTilbakekrevingsbehandlinger] =
        useState<Ressurs<ITilbakekrevingsbehandling[]>>(byggTomRessurs());

    const [manuelleBrevmottakerePåFagsak, settManuelleBrevmottakerePåFagsak] = useState<
        SkjemaBrevmottaker[]
    >([]);

    const { request } = useHttp();
    const { skalObfuskereData } = useApp();
    const { hentTilbakekrevingsbehandlinger } = useTilbakekrevingApi();
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
                    if (skalObfuskereData()) {
                        obfuskerFagsak(hentetFagsak);
                    }
                    settMinimalFagsakRessurs(hentetFagsak);
                }
            })
            .catch((_error: AxiosError) => {
                settMinimalFagsakRessurs(byggFeiletRessurs('Ukjent ved innhenting av fagsak'));
            });
    };

    const oppdaterBrukerHvisFagsakEndres = (
        bruker: Ressurs<IPersonInfo>,
        søkerFødselsnummer?: string
    ): void => {
        if (søkerFødselsnummer === undefined) {
            return;
        }

        if (
            bruker.status !== RessursStatus.SUKSESS ||
            søkerFødselsnummer !== bruker.data.personIdent
        ) {
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
                if (skalObfuskereData()) {
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
        const fagsakId = hentDataFraRessurs(minimalFagsakRessurs)?.id;

        if (fagsakId) {
            request<void, IKlagebehandling[]>({
                method: 'GET',
                url: `/familie-ks-sak/api/fagsaker/${fagsakId}/hent-klagebehandlinger`,
                påvirkerSystemLaster: true,
            }).then(klagebehandlingerRessurs => settKlagebehandlinger(klagebehandlingerRessurs));
        }
    };

    const oppdaterTilbakekrevingsbehandlingerPåFagsak = () => {
        const fagsakId = hentDataFraRessurs(minimalFagsakRessurs)?.id;

        hentTilbakekrevingsbehandlinger(fagsakId).then(tilbakekrevingsbehandlingerRessurs =>
            settTilbakekrevingsbehandlinger(tilbakekrevingsbehandlingerRessurs)
        );
    };

    useOppdaterBrukerOgEksterneBehandlingerNårFagsakEndrerSeg({
        minimalFagsakRessurs,
        settBruker,
        oppdaterBrukerHvisFagsakEndres,
        bruker,
        oppdaterKlagebehandlingerPåFagsak,
        oppdaterTilbakekrevingsbehandlingerPåFagsak,
        settManuelleBrevmottakerePåFagsak,
    });

    return (
        <FagsakContext.Provider
            value={{
                bruker,
                hentMinimalFagsak,
                minimalFagsakRessurs,
                settMinimalFagsakRessurs,
                hentBruker,
                klagebehandlinger: hentDataFraRessurs(klagebehandlinger) ?? [],
                klageStatus: klagebehandlinger.status,
                oppdaterKlagebehandlingerPåFagsak,
                tilbakekrevingsbehandlinger: hentDataFraRessurs(tilbakekrevingsbehandlinger) ?? [],
                tilbakekrevingStatus: tilbakekrevingsbehandlinger.status,
                manuelleBrevmottakerePåFagsak,
                settManuelleBrevmottakerePåFagsak,
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
