import type { PropsWithChildren } from 'react';
import { useState, createContext, useContext, useEffect } from 'react';

import { useHttp } from '@navikt/familie-http';
import type { Ressurs } from '@navikt/familie-typer';
import { byggDataRessurs, byggHenterRessurs, byggTomRessurs, RessursStatus } from '@navikt/familie-typer';

import useFagsakApi from '../../api/useFagsakApi';
import { useAppContext } from '../../context/AppContext';
import type { IMinimalFagsak } from '../../typer/fagsak';
import type { IPersonInfo } from '../../typer/person';
import { sjekkTilgangTilPerson } from '../../utils/commons';
import { obfuskerPersonInfo } from '../../utils/obfuskerData';

interface Context {
    bruker: Ressurs<IPersonInfo>;
    fagsak: IMinimalFagsak;
}

const Context = createContext<Context | undefined>(undefined);

interface Props extends PropsWithChildren {
    fagsak: IMinimalFagsak;
}

export function FagsakProvider({ fagsak, children }: Props) {
    const [bruker, settBruker] = useState<Ressurs<IPersonInfo>>(byggTomRessurs());

    const { request } = useHttp();
    const { skalObfuskereData } = useAppContext();
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

    useEffect(() => {
        hentBruker(fagsak.søkerFødselsnummer);
    }, [fagsak.søkerFødselsnummer]);

    return <Context.Provider value={{ bruker, fagsak }}>{children}</Context.Provider>;
}

export function useFagsakContext() {
    const context = useContext(Context);
    if (context === undefined) {
        throw new Error('useFagsakContext må brukes innenfor en FagsakProvider');
    }
    return context;
}
