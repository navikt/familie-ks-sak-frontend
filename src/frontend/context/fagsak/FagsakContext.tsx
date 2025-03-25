import React, { useState } from 'react';

import type { AxiosError } from 'axios';
import createUseContext from 'constate';
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

import { useOppdaterBrukerOgKlagebehandlingerNårFagsakEndrerSeg } from './useOppdaterBrukerOgKlagebehandlingerNårFagsakEndrerSeg';
import type { SkjemaBrevmottaker } from '../../komponenter/Fagsak/Personlinje/Behandlingsmeny/LeggTilEllerFjernBrevmottakere/useBrevmottakerSkjema';
import type { IInternstatistikk, IMinimalFagsak } from '../../typer/fagsak';
import type { IKlagebehandling } from '../../typer/klage';
import type { IPersonInfo } from '../../typer/person';
import { sjekkTilgangTilPerson } from '../../utils/commons';
import { obfuskerFagsak, obfuskerPersonInfo } from '../../utils/obfuskerData';
import { useApp } from '../AppContext';

const [FagsakProvider, useFagsakContext] = createUseContext(() => {
    const [minimalFagsak, settMinimalFagsak] =
        React.useState<Ressurs<IMinimalFagsak>>(byggTomRessurs());

    const [bruker, settBruker] = React.useState<Ressurs<IPersonInfo>>(byggTomRessurs());
    const [internstatistikk, settInternstatistikk] =
        React.useState<Ressurs<IInternstatistikk>>(byggTomRessurs());
    const [klagebehandlinger, settKlagebehandlinger] =
        useState<Ressurs<IKlagebehandling[]>>(byggTomRessurs());
    const [manuelleBrevmottakerePåFagsak, settManuelleBrevmottakerePåFagsak] = useState<
        SkjemaBrevmottaker[]
    >([]);

    const { request } = useHttp();
    const { skalObfuskereData } = useApp();

    const hentMinimalFagsak = (fagsakId: string | number, påvirkerSystemLaster = true): void => {
        if (påvirkerSystemLaster) {
            settMinimalFagsak(byggHenterRessurs());
        }

        request<void, IMinimalFagsak>({
            method: 'GET',
            url: `/familie-ks-sak/api/fagsaker/minimal/${fagsakId}`,
            påvirkerSystemLaster,
        })
            .then((hentetFagsak: Ressurs<IMinimalFagsak>) => {
                if (påvirkerSystemLaster || !deepEqual(hentetFagsak, minimalFagsak)) {
                    if (skalObfuskereData()) {
                        obfuskerFagsak(hentetFagsak);
                    }
                    settMinimalFagsak(hentetFagsak);
                }
            })
            .catch((_error: AxiosError) => {
                settMinimalFagsak(byggFeiletRessurs('Ukjent ved innhenting av fagsak'));
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

    const hentInternstatistikk = (): void => {
        settInternstatistikk(byggHenterRessurs());
        request<void, IInternstatistikk>({
            method: 'GET',
            url: `/familie-ks-sak/api/internstatistikk`,
        })
            .then((hentetInternstatistikk: Ressurs<IInternstatistikk>) => {
                settInternstatistikk(hentetInternstatistikk);
            })
            .catch(() => {
                settInternstatistikk(byggFeiletRessurs('Feil ved lasting av internstatistikk'));
            });
    };

    const hentFagsakForPerson = async (personId: string) => {
        return request<{ ident: string }, IMinimalFagsak>({
            method: 'POST',
            url: `/familie-ks-sak/api/fagsaker/hent-fagsak-paa-person`,
            data: {
                ident: personId,
            },
        }).then((fagsak: Ressurs<IMinimalFagsak>) => {
            return fagsak;
        });
    };

    const oppdaterKlagebehandlingerPåFagsak = () => {
        const fagsakId = hentDataFraRessurs(minimalFagsak)?.id;

        if (fagsakId) {
            request<void, IKlagebehandling[]>({
                method: 'GET',
                url: `/familie-ks-sak/api/fagsaker/${fagsakId}/hent-klagebehandlinger`,
                påvirkerSystemLaster: true,
            }).then(klagebehandlingerRessurs => settKlagebehandlinger(klagebehandlingerRessurs));
        }
    };

    useOppdaterBrukerOgKlagebehandlingerNårFagsakEndrerSeg({
        minimalFagsak,
        settBruker,
        oppdaterBrukerHvisFagsakEndres,
        bruker,
        oppdaterKlagebehandlingerPåFagsak,
        settManuelleBrevmottakerePåFagsak,
    });

    return {
        bruker,
        hentFagsakForPerson,
        hentInternstatistikk,
        hentMinimalFagsak,
        internstatistikk,
        minimalFagsak,
        settMinimalFagsak,
        hentBruker,
        klagebehandlinger: hentDataFraRessurs(klagebehandlinger) ?? [],
        klageStatus: klagebehandlinger.status,
        oppdaterKlagebehandlingerPåFagsak,
        manuelleBrevmottakerePåFagsak,
        settManuelleBrevmottakerePåFagsak,
    };
});

export { FagsakProvider, useFagsakContext };
