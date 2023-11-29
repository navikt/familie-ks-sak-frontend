import { useEffect, useState } from 'react';

import { ok, useFelt, useSkjema } from '@navikt/familie-skjema';
import type { FeltState } from '@navikt/familie-skjema';
import { byggHenterRessurs, RessursStatus } from '@navikt/familie-typer';
import type { Ressurs } from '@navikt/familie-typer';

import type { IBehandling } from '../../typer/behandling';
import type { IRestKorrigertVedtak } from '../../typer/vedtak';
import { dateTilIsoDatoString, validerGyldigDato } from '../../utils/dato';
import { useBehandling } from '../behandlingContext/BehandlingContext';

interface IProps {
    onSuccess: () => void;
    behandlingId: number;
    korrigertVedtak?: IRestKorrigertVedtak;
}

export const useKorrigerVedtakSkjemaContext = ({
    behandlingId,
    korrigertVedtak,
    onSuccess,
}: IProps) => {
    const { settÅpenBehandling } = useBehandling();
    const [restFeil, settRestFeil] = useState<string | undefined>(undefined);

    const {
        skjema,
        valideringErOk,
        kanSendeSkjema,
        settVisfeilmeldinger,
        onSubmit,
        nullstillSkjema,
        settSubmitRessurs,
    } = useSkjema<
        {
            vedtaksdato: Date | undefined;
            begrunnelse: string;
        },
        IBehandling
    >({
        felter: {
            vedtaksdato: useFelt<Date | undefined>({
                verdi: undefined,
                valideringsfunksjon: validerGyldigDato,
            }),
            begrunnelse: useFelt<string>({
                verdi: korrigertVedtak?.begrunnelse || '',
                valideringsfunksjon: (felt: FeltState<string>): FeltState<string> => ok(felt),
            }),
        },
        skjemanavn: 'korriger-vedtak-skjema',
    });

    useEffect(() => {
        const opprinneligVedtaksdato = korrigertVedtak
            ? new Date(korrigertVedtak.vedtaksdato)
            : undefined;
        skjema.felter.vedtaksdato.validerOgSettFelt(opprinneligVedtaksdato);
    }, []);

    const korrigertVedtakURL = `/familie-ks-sak/api/korrigertvedtak/behandling/${behandlingId}`;

    const lagreKorrigertVedtak = () => {
        if (kanSendeSkjema()) {
            settVisfeilmeldinger(false);
            settSubmitRessurs(byggHenterRessurs());
            onSubmit<IRestKorrigertVedtak>(
                {
                    method: 'POST',
                    data: {
                        vedtaksdato: dateTilIsoDatoString(skjema.felter.vedtaksdato.verdi),
                        begrunnelse: skjema.felter.begrunnelse.verdi,
                    },
                    url: korrigertVedtakURL,
                },
                (response: Ressurs<IBehandling>) => {
                    if (response.status === RessursStatus.SUKSESS) {
                        settRestFeil(undefined);
                        onSuccess();
                        nullstillSkjema();
                        settÅpenBehandling(response);
                    }
                },
                (error: Ressurs<IBehandling>) => {
                    if (
                        error.status === RessursStatus.FEILET ||
                        error.status === RessursStatus.FUNKSJONELL_FEIL
                    ) {
                        settRestFeil(error.frontendFeilmelding);
                    } else {
                        settRestFeil('Teknisk feil ved lagring av korrigert vedtak');
                    }
                }
            );
        } else {
            settVisfeilmeldinger(true);
        }
    };

    const angreKorrigering = () => {
        onSubmit(
            {
                method: 'PATCH',
                url: korrigertVedtakURL,
            },
            (response: Ressurs<IBehandling>) => {
                if (response.status === RessursStatus.SUKSESS) {
                    settRestFeil(undefined);
                    onSuccess();
                    nullstillSkjema();
                    settÅpenBehandling(response);
                }
            },
            () => {
                settRestFeil('Teknisk feil ved fjerning av korrigert vedtak');
            }
        );
    };

    return {
        skjema,
        valideringErOk,
        lagreKorrigertVedtak,
        nullstillSkjema,
        restFeil,
        angreKorrigering,
        settVisfeilmeldinger,
        settRestFeil,
    };
};
