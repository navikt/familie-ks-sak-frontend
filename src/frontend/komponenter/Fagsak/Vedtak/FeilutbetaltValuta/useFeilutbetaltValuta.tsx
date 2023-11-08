import { useFelt, useSkjema } from '@navikt/familie-skjema';
import type { Ressurs } from '@navikt/familie-typer';
import { RessursStatus } from '@navikt/familie-typer';

import { validerFeilutbetaltBeløp, validerTom, validerFom } from './FeilutbetaltValutaUtil';
import { useBehandling } from '../../../../context/behandlingContext/BehandlingContext';
import type { IBehandling } from '../../../../typer/behandling';
import type {
    IFeilutbetaltValutaSkjemaFelter,
    IRestNyFeilutbetaltValutaPeriode,
    IRestFeilutbetaltValuta,
} from '../../../../typer/eøs-feilutbetalt-valuta';
import type { FamilieIsoDate } from '../../../../utils/kalender';

interface IProps {
    behandlingId: number;
    feilutbetaltValuta?: IRestFeilutbetaltValuta;
    settFeilmelding: (feilmelding: string) => void;
}

const useFeilutbetaltValuta = ({ feilutbetaltValuta, settFeilmelding, behandlingId }: IProps) => {
    const { settÅpenBehandling } = useBehandling();

    const fomFelt = useFelt<FamilieIsoDate>({
        verdi: feilutbetaltValuta?.fom ?? '',
        valideringsfunksjon: validerFom,
    });

    const { skjema, kanSendeSkjema, onSubmit, nullstillSkjema, valideringErOk } = useSkjema<
        IFeilutbetaltValutaSkjemaFelter,
        IBehandling
    >({
        felter: {
            fom: fomFelt,
            tom: useFelt<FamilieIsoDate>({
                verdi: feilutbetaltValuta?.tom ?? '',
                avhengigheter: {
                    fom: fomFelt,
                },
                valideringsfunksjon: (felt, avhengigheter) =>
                    validerTom(felt, avhengigheter?.fom.verdi as FamilieIsoDate),
            }),
            feilutbetaltBeløp: useFelt<string>({
                verdi: feilutbetaltValuta?.feilutbetaltBeløp.toString() ?? '',
                valideringsfunksjon: validerFeilutbetaltBeløp,
            }),
        },
        skjemanavn: 'Feilutbetalt valuta',
    });

    const lagreNyPeriode = (lukkNyPeriode: () => void) => {
        if (kanSendeSkjema()) {
            onSubmit<IRestNyFeilutbetaltValutaPeriode>(
                {
                    method: 'POST',
                    url: `/familie-ks-sak/api/feilutbetalt-valuta/behandlinger/${behandlingId}`,
                    data: {
                        fom: skjema.felter.fom?.verdi,
                        tom: skjema.felter.tom?.verdi,
                        feilutbetaltBeløp: Number(skjema.felter.feilutbetaltBeløp.verdi),
                    },
                },
                (behandling: Ressurs<IBehandling>) => {
                    if (behandling.status === RessursStatus.SUKSESS) {
                        settÅpenBehandling(behandling);
                        lukkNyPeriode();
                    } else {
                        settFeilmelding('Klarte ikke å lagre ny periode');
                    }
                }
            );
        }
    };

    const oppdaterEksisterendePeriode = async () => {
        if (kanSendeSkjema() && feilutbetaltValuta) {
            onSubmit<IRestFeilutbetaltValuta>(
                {
                    method: 'PUT',
                    url: `/familie-ks-sak/api/feilutbetalt-valuta/behandlinger/${behandlingId}/${feilutbetaltValuta.id}`,
                    data: {
                        ...feilutbetaltValuta,
                        id: feilutbetaltValuta.id,
                        fom: skjema.felter.fom.verdi,
                        tom: skjema.felter.tom.verdi,
                        feilutbetaltBeløp: Number(skjema.felter.feilutbetaltBeløp.verdi),
                    },
                },
                (behandling: Ressurs<IBehandling>) => {
                    if (behandling.status === RessursStatus.SUKSESS) {
                        settÅpenBehandling(behandling);
                    } else {
                        settFeilmelding('Klarte ikke å lagre endringer');
                    }
                }
            );
        }
    };

    const fjernPeriode = async () => {
        if (feilutbetaltValuta) {
            onSubmit(
                {
                    method: 'DELETE',
                    url: `/familie-ks-sak/api/feilutbetalt-valuta/behandlinger/${behandlingId}/${feilutbetaltValuta.id}`,
                },
                (behandling: Ressurs<IBehandling>) => {
                    if (behandling.status === RessursStatus.SUKSESS) {
                        settÅpenBehandling(behandling);
                    } else {
                        settFeilmelding('Klarte ikke å slette periode');
                    }
                }
            );
        }
    };

    return {
        skjema,
        lagreNyPeriode,
        oppdaterEksisterendePeriode,
        fjernPeriode,
        nullstillSkjema,
        valideringErOk,
    };
};

export { useFeilutbetaltValuta };
