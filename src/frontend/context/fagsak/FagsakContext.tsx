import React, {
    createContext,
    type PropsWithChildren,
    useContext,
    useEffect,
    useState,
} from 'react';

import { useHttp } from '@navikt/familie-http';
import type { Ressurs } from '@navikt/familie-typer';
import {
    byggDataRessurs,
    byggHenterRessurs,
    byggTomRessurs,
    RessursStatus,
} from '@navikt/familie-typer';

import useFagsakApi from '../../api/useFagsakApi';
import type { SkjemaBrevmottaker } from '../../sider/Fagsak/Fagsaklinje/Behandlingsmeny/LeggTilEllerFjernBrevmottakere/useBrevmottakerSkjema';
import type { IMinimalFagsak } from '../../typer/fagsak';
import type { IPersonInfo } from '../../typer/person';
import { sjekkTilgangTilPerson } from '../../utils/commons';
import { obfuskerPersonInfo } from '../../utils/obfuskerData';
import { useAppContext } from '../AppContext';

interface IFagsakContext {
    bruker: Ressurs<IPersonInfo>;
    fagsak: IMinimalFagsak;
    manuelleBrevmottakerePåFagsak: SkjemaBrevmottaker[];
    settManuelleBrevmottakerePåFagsak: (brevmottakere: SkjemaBrevmottaker[]) => void;
}

const FagsakContext = createContext<IFagsakContext | undefined>(undefined);

interface Props extends PropsWithChildren {
    fagsak: IMinimalFagsak;
}

export const FagsakProvider = ({ fagsak, children }: Props) => {
    const [bruker, settBruker] = React.useState<Ressurs<IPersonInfo>>(byggTomRessurs());

    const [manuelleBrevmottakerePåFagsak, settManuelleBrevmottakerePåFagsak] = useState<
        SkjemaBrevmottaker[]
    >([]);

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

    return (
        <FagsakContext.Provider
            value={{
                bruker,
                fagsak,
                manuelleBrevmottakerePåFagsak,
                settManuelleBrevmottakerePåFagsak,
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
