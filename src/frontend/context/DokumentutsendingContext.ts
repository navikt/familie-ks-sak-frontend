import { useEffect, useState } from 'react';

import createUseContext from 'constate';
import deepEqual from 'deep-equal';

import { feil, ok, useFelt, useSkjema } from '@navikt/familie-skjema';
import type { FeltState } from '@navikt/familie-skjema';
import { RessursStatus } from '@navikt/familie-typer';

import { useFagsakContext } from './fagsak/FagsakContext';
import useDokument from '../hooks/useDokument';
import { hentEnkeltInformasjonsbrevRequest } from '../komponenter/Fagsak/Dokumentutsending/Informasjonsbrev/enkeltInformasjonsbrevUtils';
import { Informasjonsbrev } from '../komponenter/Felleskomponenter/Hendelsesoversikt/BrevModul/typer';
import type { IManueltBrevRequestPåFagsak } from '../typer/dokument';
import { Målform } from '../typer/søknad';
import { hentFrontendFeilmelding } from '../utils/ressursUtils';

export enum DokumentÅrsak {
    KAN_SØKE_EØS = 'KAN_SØKE_EØS',
}

export const dokumentÅrsak: Record<DokumentÅrsak, string> = {
    KAN_SØKE_EØS: 'Kan søke EØS',
};

export const [DokumentutsendingProvider, useDokumentutsending] = createUseContext(
    ({ fagsakId }: { fagsakId: number }) => {
        const { bruker } = useFagsakContext();
        const [visInnsendtBrevModal, settVisInnsendtBrevModal] = useState(false);
        const { hentForhåndsvisning, hentetDokument } = useDokument();

        const [sistBrukteDataVedForhåndsvisning, settSistBrukteDataVedForhåndsvisning] = useState<
            IManueltBrevRequestPåFagsak | undefined
        >(undefined);

        const målform = useFelt<Målform | undefined>({
            verdi: Målform.NB,
        });

        const årsak = useFelt<DokumentÅrsak | undefined>({
            verdi: undefined,
            valideringsfunksjon: (felt: FeltState<DokumentÅrsak | undefined>) => {
                return felt.verdi ? ok(felt) : feil(felt, 'Du må velge en årsak');
            },
        });

        const {
            skjema,
            kanSendeSkjema,
            onSubmit,
            nullstillSkjema: nullstillHeleSkjema,
            settVisfeilmeldinger,
        } = useSkjema<
            {
                årsak: DokumentÅrsak | undefined;
                målform: Målform | undefined;
            },
            string
        >({
            felter: {
                årsak: årsak,
                målform: målform,
            },
            skjemanavn: 'Dokumentutsending',
        });

        const nullstillSkjemaUtenomÅrsak = () => {
            skjema.felter.målform.nullstill();
        };

        const nullstillSkjema = () => {
            nullstillHeleSkjema();
        };

        useEffect(() => {
            nullstillSkjemaUtenomÅrsak();
        }, [årsak.verdi, bruker.status]);

        const hentSkjemaData = (): IManueltBrevRequestPåFagsak => {
            const dokumentÅrsak = skjema.felter.årsak.verdi;
            if (bruker.status === RessursStatus.SUKSESS && dokumentÅrsak) {
                switch (dokumentÅrsak) {
                    case DokumentÅrsak.KAN_SØKE_EØS:
                        return hentEnkeltInformasjonsbrevRequest({
                            bruker: bruker,
                            målform: målform.verdi ?? Målform.NB,
                            brevmal: Informasjonsbrev.INFORMASJONSBREV_KAN_SØKE_EØS,
                        });
                }
            } else {
                throw Error('Bruker ikke hentet inn og vi kan ikke sende inn skjema');
            }
        };

        const skjemaErLåst = () =>
            skjema.submitRessurs.status === RessursStatus.HENTER ||
            hentetDokument.status === RessursStatus.HENTER;

        const senderBrev = () => skjema.submitRessurs.status === RessursStatus.HENTER;

        const hentForhåndsvisningPåFagsak = () => {
            const skjemaData = hentSkjemaData();
            settSistBrukteDataVedForhåndsvisning(skjemaData);
            hentForhåndsvisning<IManueltBrevRequestPåFagsak>({
                method: 'POST',
                data: skjemaData,
                url: `/familie-ks-sak/api/brev/fagsak/${fagsakId}/forhaandsvis-brev`,
            });
        };

        const sendBrevPåFagsak = () => {
            if (kanSendeSkjema()) {
                onSubmit(
                    {
                        method: 'POST',
                        data: hentSkjemaData(),
                        url: `/familie-ks-sak/api/brev/fagsak/${fagsakId}/send-brev`,
                    },
                    () => {
                        settVisInnsendtBrevModal(true);
                        nullstillSkjema();
                    }
                );
            }
        };

        const hentSkjemaFeilmelding = () =>
            hentFrontendFeilmelding(hentetDokument) ||
            hentFrontendFeilmelding(skjema.submitRessurs);

        return {
            fagsakId,
            hentForhåndsvisningPåFagsak,
            hentSkjemaFeilmelding,
            hentetDokument,
            sendBrevPåFagsak,
            senderBrev,
            settVisInnsendtBrevModal,
            settVisfeilmeldinger,
            skjemaErLåst,
            visForhåndsvisningBeskjed: () =>
                !deepEqual(hentSkjemaData(), sistBrukteDataVedForhåndsvisning),
            visInnsendtBrevModal,
            skjema,
            nullstillSkjema,
        };
    }
);
