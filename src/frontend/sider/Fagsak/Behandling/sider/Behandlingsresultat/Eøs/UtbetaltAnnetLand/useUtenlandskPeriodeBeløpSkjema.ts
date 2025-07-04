import React from 'react';

import { useHttp } from '@navikt/familie-http';
import { feil, ok, useFelt, useSkjema } from '@navikt/familie-skjema';
import type { FeltState } from '@navikt/familie-skjema';
import { byggTomRessurs, RessursStatus } from '@navikt/familie-typer';
import type { Ressurs } from '@navikt/familie-typer';

import { BehandlingÅrsak, type IBehandling } from '../../../../../../../typer/behandling';
import type { OptionType } from '../../../../../../../typer/common';
import type {
    EøsPeriodeStatus,
    IRestUtenlandskPeriodeBeløp,
    IUtenlandskPeriodeBeløp,
    UtenlandskPeriodeBeløpIntervall,
} from '../../../../../../../typer/eøsPerioder';
import { nyIsoMånedPeriode, type IIsoMånedPeriode } from '../../../../../../../utils/dato';
import {
    erBarnGyldig,
    erEøsPeriodeGyldig,
    isEmpty,
    isNumeric,
} from '../../../../../../../utils/eøsValidators';
import { useBehandlingContext } from '../../../../context/BehandlingContext';
import { konverterDesimalverdiTilSkjemaVisning, konverterSkjemaverdiTilDesimal } from '../utils';

const erBeløpGyldig = (felt: FeltState<string | undefined>): FeltState<string | undefined> => {
    if (!felt.verdi || isEmpty(felt.verdi) || typeof felt.verdi != 'string') {
        return feil(felt, 'Beløp er påkrevd, men mangler input');
    }
    const nyttBeløp = konverterSkjemaverdiTilDesimal(felt.verdi);
    if (!nyttBeløp) {
        return feil(felt, 'Beløp er påkrevd, men mangler input');
    }
    if (!isNumeric(nyttBeløp)) {
        return feil(felt, `Beløp innholder ugyldige verdier, beløp: ${felt.verdi}`);
    }
    const beløp = Number(nyttBeløp);
    if (beløp < 0) {
        return feil(felt, `Kan ikke registrere negativt utbetalt beløp: ${felt.verdi}`);
    }
    return ok(felt);
};
const erValutaGyldig = (felt: FeltState<string | undefined>): FeltState<string | undefined> =>
    !isEmpty(felt.verdi) ? ok(felt) : feil(felt, 'Valuta er påkrevd, men mangler input');
const erIntervallGyldig = (
    felt: FeltState<UtenlandskPeriodeBeløpIntervall | undefined>
): FeltState<UtenlandskPeriodeBeløpIntervall | undefined> =>
    !isEmpty(felt.verdi) ? ok(felt) : feil(felt, 'Intervall er påkrevd, men mangler input');

export const utenlandskPeriodeBeløpFeilmeldingId = (
    utenlandskPeriodeBeløp: IRestUtenlandskPeriodeBeløp
): string =>
    `utd_beløp_${utenlandskPeriodeBeløp.barnIdenter.map(barn => `${barn}-`)}_${
        utenlandskPeriodeBeløp.fom
    }`;

interface IProps {
    utenlandskPeriodeBeløp: IRestUtenlandskPeriodeBeløp;
    barnIUtenlandskPeriodeBeløp: OptionType[];
}

const useUtenlandskPeriodeBeløpSkjema = ({
    barnIUtenlandskPeriodeBeløp,
    utenlandskPeriodeBeløp,
}: IProps) => {
    const [erUtenlandskPeriodeBeløpEkspandert, settErUtenlandskPeriodeBeløpEkspandert] =
        React.useState<boolean>(false);
    const { åpenBehandling, settÅpenBehandling } = useBehandlingContext();
    const behandlingId =
        åpenBehandling.status === RessursStatus.SUKSESS ? åpenBehandling.data.behandlingId : null;
    const behandlingsÅrsakErOvergangsordning =
        åpenBehandling.status === RessursStatus.SUKSESS
            ? åpenBehandling.data.årsak === BehandlingÅrsak.OVERGANGSORDNING_2024
            : false;
    const initelFom = useFelt<string>({ verdi: utenlandskPeriodeBeløp.fom });
    const { request } = useHttp();

    const {
        skjema,
        valideringErOk,
        kanSendeSkjema,
        onSubmit,
        nullstillSkjema,
        settSubmitRessurs,
        settVisfeilmeldinger,
    } = useSkjema<IUtenlandskPeriodeBeløp, IBehandling>({
        felter: {
            periodeId: useFelt<string>({
                verdi: utenlandskPeriodeBeløpFeilmeldingId(utenlandskPeriodeBeløp),
            }),
            id: useFelt<number>({ verdi: utenlandskPeriodeBeløp.id }),
            status: useFelt<EøsPeriodeStatus>({ verdi: utenlandskPeriodeBeløp.status }),
            initielFom: initelFom,
            barnIdenter: useFelt<OptionType[]>({
                verdi: barnIUtenlandskPeriodeBeløp,
                valideringsfunksjon: erBarnGyldig,
            }),
            periode: useFelt<IIsoMånedPeriode>({
                verdi: nyIsoMånedPeriode(utenlandskPeriodeBeløp.fom, utenlandskPeriodeBeløp.tom),
                avhengigheter: { initelFom },
                valideringsfunksjon: (felt, avhengigheter) =>
                    erEøsPeriodeGyldig(behandlingsÅrsakErOvergangsordning, felt, avhengigheter),
            }),
            beløp: useFelt<string | undefined>({
                verdi: konverterDesimalverdiTilSkjemaVisning(utenlandskPeriodeBeløp.beløp),
                valideringsfunksjon: erBeløpGyldig,
            }),
            valutakode: useFelt<string | undefined>({
                verdi: utenlandskPeriodeBeløp.valutakode,
                valideringsfunksjon: erValutaGyldig,
            }),
            intervall: useFelt<UtenlandskPeriodeBeløpIntervall | undefined>({
                verdi: utenlandskPeriodeBeløp.intervall,
                valideringsfunksjon: erIntervallGyldig,
            }),
        },
        skjemanavn: utenlandskPeriodeBeløpFeilmeldingId(utenlandskPeriodeBeløp),
    });

    const sendInnSkjema = () => {
        if (kanSendeSkjema()) {
            const nyttBeløp = konverterSkjemaverdiTilDesimal(skjema.felter.beløp?.verdi);
            if (!nyttBeløp || !isNumeric(nyttBeløp)) {
                throw Error('Skal ikke kunne skje. Beløp er validert annen plass i koden.');
            }
            settSubmitRessurs(byggTomRessurs());
            settVisfeilmeldinger(false);
            onSubmit(
                {
                    method: 'PUT',
                    data: {
                        id: utenlandskPeriodeBeløp.id,
                        fom: skjema.felter.periode.verdi.fom,
                        tom: skjema.felter.periode.verdi.tom,
                        barnIdenter: skjema.felter.barnIdenter.verdi.map(barn => barn.value),
                        beløp: nyttBeløp,
                        valutakode: skjema.felter.valutakode?.verdi,
                        intervall: skjema.felter.intervall?.verdi,
                    },
                    url: `/familie-ks-sak/api/differanseberegning/utenlandskperidebeløp/${behandlingId}`,
                },
                (response: Ressurs<IBehandling>) => {
                    if (response.status === RessursStatus.SUKSESS) {
                        nullstillSkjema();
                        settErUtenlandskPeriodeBeløpEkspandert(false);
                        settÅpenBehandling(response);
                    }
                }
            );
        }
    };

    const slettUtenlandskPeriodeBeløp = () => {
        settSubmitRessurs(byggTomRessurs());
        settVisfeilmeldinger(false);
        request<void, IBehandling>({
            method: 'DELETE',
            url: `/familie-ks-sak/api/differanseberegning/utenlandskperidebeløp/${behandlingId}/${utenlandskPeriodeBeløp.id}`,
        }).then((response: Ressurs<IBehandling>) => {
            if (response.status === RessursStatus.SUKSESS) {
                nullstillSkjema();
                settErUtenlandskPeriodeBeløpEkspandert(false);
                settÅpenBehandling(response);
            } else {
                settSubmitRessurs(response);
                settVisfeilmeldinger(true);
            }
        });
    };

    const erUtenlandskPeriodeBeløpSkjemaEndret = () => {
        const barnFjernetISkjema = utenlandskPeriodeBeløp.barnIdenter.filter(
            barn => !skjema.felter.barnIdenter.verdi.some(ident => ident.value === barn)
        );
        const erTomEndret =
            !(
                skjema.felter.periode.verdi.tom === undefined && utenlandskPeriodeBeløp.tom === null
            ) && skjema.felter.periode?.verdi.tom !== utenlandskPeriodeBeløp.tom;
        return (
            barnFjernetISkjema.length > 0 ||
            skjema.felter.periode?.verdi.fom !== utenlandskPeriodeBeløp.fom ||
            erTomEndret ||
            skjema.felter.beløp?.verdi !==
                konverterDesimalverdiTilSkjemaVisning(utenlandskPeriodeBeløp.beløp) ||
            skjema.felter.valutakode?.verdi !== utenlandskPeriodeBeløp.valutakode ||
            skjema.felter.intervall?.verdi !== utenlandskPeriodeBeløp.intervall
        );
    };

    return {
        erUtenlandskPeriodeBeløpEkspandert,
        settErUtenlandskPeriodeBeløpEkspandert,
        skjema,
        valideringErOk,
        sendInnSkjema,
        slettUtenlandskPeriodeBeløp,
        nullstillSkjema,
        kanSendeSkjema,
        erUtenlandskPeriodeBeløpSkjemaEndret,
    };
};

export { useUtenlandskPeriodeBeløpSkjema };
