import React, { useState } from 'react';

import { useNavigate } from 'react-router';

import type { ISøkeresultat } from '@navikt/familie-header';
import { ikoner, Søk } from '@navikt/familie-header';
import { useHttp } from '@navikt/familie-http';
import type { Ressurs } from '@navikt/familie-typer';
import {
    byggFeiletRessurs,
    byggFunksjonellFeilRessurs,
    byggHenterRessurs,
    byggTomRessurs,
    kjønnType,
    RessursStatus,
} from '@navikt/familie-typer';
import { idnr } from '@navikt/fnrvalidator';

import OpprettFagsakModal from './OpprettFagsakModal';
import { useAppContext } from '../../context/AppContext';
import IkkeTilgang from '../../ikoner/IkkeTilgang';
import type { IFagsakDeltager, ISøkParam } from '../../typer/fagsakdeltager';
import { fagsakdeltagerRoller } from '../../typer/fagsakdeltager';
import { obfuskerFagsakDeltager } from '../../utils/obfuskerData';

const FagsakDeltagerSøk: React.FC = () => {
    const { request } = useHttp();
    const navigate = useNavigate();
    const { skalObfuskereData } = useAppContext();

    const [fagsakDeltagere, settFagsakDeltagere] =
        React.useState<Ressurs<IFagsakDeltager[]>>(byggTomRessurs());

    const [deltagerForOpprettFagsak, settDeltagerForOpprettFagsak] = useState<
        ISøkeresultat | undefined
    >(undefined);

    const fnrValidator = (verdi: string): boolean => {
        return idnr(verdi).status === 'valid';
    };

    const søk = (personIdent: string): void => {
        if (personIdent === '') {
            settFagsakDeltagere(byggTomRessurs);
            return;
        }

        if (fnrValidator(personIdent) || process.env.NODE_ENV === 'development') {
            settFagsakDeltagere(byggHenterRessurs());
            request<ISøkParam, IFagsakDeltager[]>({
                method: 'POST',
                url: 'familie-ks-sak/api/fagsaker/sok',
                data: {
                    personIdent,
                },
            })
                .then((response: Ressurs<IFagsakDeltager[]>) => {
                    if (response.status === RessursStatus.SUKSESS) {
                        if (skalObfuskereData()) {
                            obfuskerFagsakDeltager(response);
                        }
                        settFagsakDeltagere(response);
                    } else if (
                        response.status === RessursStatus.FEILET ||
                        response.status === RessursStatus.FUNKSJONELL_FEIL ||
                        response.status === RessursStatus.IKKE_TILGANG
                    ) {
                        settFagsakDeltagere(response);
                    }
                })
                .catch(_ => {
                    settFagsakDeltagere(byggFeiletRessurs('Søk feilet'));
                });
        } else {
            settFagsakDeltagere(
                byggFunksjonellFeilRessurs('Ugyldig fødsels- eller d-nummer (11 siffer)')
            );
        }
    };

    const mapTilSøkeresultater = (): Ressurs<ISøkeresultat[]> =>
        fagsakDeltagere.status === RessursStatus.SUKSESS
            ? {
                  ...fagsakDeltagere,
                  data: fagsakDeltagere.data.map((fagsakDeltager: IFagsakDeltager) => {
                      return {
                          adressebeskyttelseGradering: fagsakDeltager.adressebeskyttelseGradering,
                          fagsakId: fagsakDeltager.fagsakId,
                          harTilgang: fagsakDeltager.harTilgang,
                          navn: fagsakDeltager.navn,
                          ident: fagsakDeltager.ident,
                          ikon: fagsakDeltager.harTilgang ? (
                              ikoner[`${fagsakDeltager.rolle}_${fagsakDeltager.kjønn}`]
                          ) : (
                              <IkkeTilgang height={30} width={30} />
                          ),
                          rolle: fagsakdeltagerRoller[fagsakDeltager.rolle][
                              fagsakDeltager.kjønn ?? kjønnType.UKJENT
                          ],
                      };
                  }),
              }
            : fagsakDeltagere;

    return (
        <>
            <Søk
                søk={søk}
                label={'Søkefelt. Fødsels- eller D-nummer (11 siffer)'}
                placeholder={'Fødsels- eller D-nummer (11 siffer)'}
                nullstillSøkeresultater={() => settFagsakDeltagere(byggTomRessurs())}
                søkeresultater={mapTilSøkeresultater()}
                søkeresultatOnClick={(søkeresultat: ISøkeresultat) =>
                    søkeresultat.fagsakId
                        ? navigate(`/fagsak/${søkeresultat.fagsakId}/saksoversikt`)
                        : søkeresultat.harTilgang && settDeltagerForOpprettFagsak(søkeresultat)
                }
            />
            {deltagerForOpprettFagsak && (
                <OpprettFagsakModal
                    søkeresultat={deltagerForOpprettFagsak}
                    lukkModal={() => settDeltagerForOpprettFagsak(undefined)}
                />
            )}
        </>
    );
};

export default FagsakDeltagerSøk;
