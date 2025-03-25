import { useState } from 'react';

import deepEqual from 'deep-equal';

import { useHttp } from '@navikt/familie-http';
import { feil, ok, useFelt, useSkjema } from '@navikt/familie-skjema';
import { RessursStatus, type Ressurs } from '@navikt/familie-typer';

import type { IBehandling } from '../typer/behandling';
import { type IRestEndretUtbetalingAndel } from '../typer/utbetalingAndel';
import { IEndretUtbetalingAndelÅrsak } from '../typer/utbetalingAndel';
import type { Begrunnelse } from '../typer/vedtak';
import type { IsoMånedString } from '../utils/dato';
import {
    dateTilIsoDatoStringEllerUndefined,
    erIsoStringGyldig,
    validerGyldigDato,
} from '../utils/dato';
import { erAvslagBegrunnelseGyldig } from '../utils/validators';
import { useBehandling } from './behandlingContext/BehandlingContext';

export interface IEndretUtbetalingAndelSkjema {
    person: string | undefined;
    fom: IsoMånedString | undefined;
    tom: IsoMånedString | undefined;
    periodeSkalUtbetalesTilSøker: boolean | undefined;
    årsak: IEndretUtbetalingAndelÅrsak | undefined;
    søknadstidspunkt: Date | undefined;
    begrunnelse: string | undefined;
    erEksplisittAvslagPåSøknad: boolean | undefined;
    vedtaksbegrunnelser: Begrunnelse[] | undefined;
}

export const useEndretUtbetalingAndel = (
    endretUtbetalingAndel: IRestEndretUtbetalingAndel,
    åpenBehandling: IBehandling
) => {
    const { request } = useHttp();
    const { settÅpenBehandling } = useBehandling();

    const årsakFelt = useFelt<IEndretUtbetalingAndelÅrsak | undefined>({
        verdi: undefined,
        valideringsfunksjon: felt =>
            felt.verdi && Object.values(IEndretUtbetalingAndelÅrsak).includes(felt.verdi)
                ? ok(felt)
                : feil(felt, 'Du må velge en årsak'),
    });

    const periodeSkalUtbetalesTilSøkerFelt = useFelt<boolean | undefined>({
        verdi: undefined,
    });

    const erEksplisittAvslagPåSøknad = useFelt<boolean | undefined>({
        verdi: endretUtbetalingAndel.erEksplisittAvslagPåSøknad,
    });

    const { skjema, kanSendeSkjema, onSubmit } = useSkjema<
        IEndretUtbetalingAndelSkjema,
        IBehandling
    >({
        felter: {
            person: useFelt<string | undefined>({
                verdi: undefined,
                valideringsfunksjon: felt =>
                    felt.verdi ? ok(felt) : feil(felt, 'Du må velge en person'),
            }),
            fom: useFelt<IsoMånedString | undefined>({
                verdi: undefined,
                valideringsfunksjon: felt =>
                    erIsoStringGyldig(felt.verdi) ? ok(felt) : feil(felt, 'Du må velge f.o.m-dato'),
            }),
            tom: useFelt<IsoMånedString | undefined>({
                verdi: undefined,
                valideringsfunksjon: felt =>
                    erIsoStringGyldig(felt.verdi) ? ok(felt) : feil(felt, 'Du må velge t.o.m-dato'),
            }),
            periodeSkalUtbetalesTilSøker: periodeSkalUtbetalesTilSøkerFelt,
            årsak: årsakFelt,
            søknadstidspunkt: useFelt<Date | undefined>({
                verdi: undefined,
                valideringsfunksjon: validerGyldigDato,
            }),
            begrunnelse: useFelt<string | undefined>({
                verdi: undefined,
                valideringsfunksjon: felt =>
                    felt.verdi ? ok(felt) : feil(felt, 'Du må oppgi en begrunnelse.'),
            }),
            erEksplisittAvslagPåSøknad: erEksplisittAvslagPåSøknad,
            vedtaksbegrunnelser: useFelt<Begrunnelse[] | undefined>({
                verdi: undefined,
                valideringsfunksjon: erAvslagBegrunnelseGyldig,
                avhengigheter: {
                    erEksplisittAvslagPåSøknad: erEksplisittAvslagPåSøknad.verdi,
                    årsak: årsakFelt,
                },
            }),
        },
        skjemanavn: 'Endre utbetalingsperiode',
    });

    const settFelterTilDefault = () => {
        skjema.felter.person.validerOgSettFelt(endretUtbetalingAndel.personIdent);
        skjema.felter.fom.validerOgSettFelt(endretUtbetalingAndel.fom);
        skjema.felter.tom.validerOgSettFelt(endretUtbetalingAndel.tom);
        skjema.felter.periodeSkalUtbetalesTilSøker.validerOgSettFelt(
            endretUtbetalingAndel.prosent !== undefined && endretUtbetalingAndel.prosent > 0
        );
        skjema.felter.årsak.validerOgSettFelt(endretUtbetalingAndel.årsak);
        skjema.felter.begrunnelse.validerOgSettFelt(endretUtbetalingAndel.begrunnelse);
        skjema.felter.erEksplisittAvslagPåSøknad.validerOgSettFelt(
            endretUtbetalingAndel.erEksplisittAvslagPåSøknad
        );
        skjema.felter.vedtaksbegrunnelser.validerOgSettFelt(
            endretUtbetalingAndel.vedtaksbegrunnelser
        );
        skjema.felter.søknadstidspunkt.validerOgSettFelt(
            endretUtbetalingAndel.søknadstidspunkt
                ? new Date(endretUtbetalingAndel.søknadstidspunkt)
                : undefined
        );
    };

    const [forrigeEndretUtbetalingAndel, settForrigeEndretUtbetalingAndel] =
        useState<IRestEndretUtbetalingAndel>();

    if (endretUtbetalingAndel !== forrigeEndretUtbetalingAndel) {
        settForrigeEndretUtbetalingAndel(endretUtbetalingAndel);
        settFelterTilDefault();
    }

    const hentProsentForEndretUtbetaling = () => {
        return skjema.felter.periodeSkalUtbetalesTilSøker.verdi ? 100 : 0;
    };

    const hentSkjemaData = () => {
        const {
            person,
            fom,
            tom,
            årsak,
            begrunnelse,
            søknadstidspunkt,
            erEksplisittAvslagPåSøknad,
            vedtaksbegrunnelser,
        } = skjema.felter;
        return {
            id: endretUtbetalingAndel.id,
            personIdent: person && person.verdi,
            prosent: hentProsentForEndretUtbetaling(),
            fom: fom && fom.verdi,
            tom: tom && tom.verdi,
            årsak: årsak && årsak.verdi,
            begrunnelse: begrunnelse.verdi,
            søknadstidspunkt: dateTilIsoDatoStringEllerUndefined(søknadstidspunkt.verdi),
            erTilknyttetAndeler: endretUtbetalingAndel.erTilknyttetAndeler,
            erEksplisittAvslagPåSøknad: erEksplisittAvslagPåSøknad.verdi,
            vedtaksbegrunnelser: vedtaksbegrunnelser && vedtaksbegrunnelser.verdi,
        };
    };

    const skjemaHarEndringerSomIkkeErLagret = () =>
        !deepEqual(
            {
                ...endretUtbetalingAndel,
                prosent:
                    typeof endretUtbetalingAndel.prosent === 'number'
                        ? endretUtbetalingAndel.prosent
                        : 0,
            },
            hentSkjemaData()
        );

    const oppdaterEndretUtbetaling = (avbrytEndringAvUtbetalingsperiode: () => void) => {
        if (kanSendeSkjema()) {
            onSubmit<IRestEndretUtbetalingAndel>(
                {
                    method: 'PUT',
                    url: `/familie-ks-sak/api/endretutbetalingandel/${åpenBehandling.behandlingId}/${endretUtbetalingAndel.id}`,
                    påvirkerSystemLaster: true,
                    data: hentSkjemaData(),
                },
                (behandling: Ressurs<IBehandling>) => {
                    if (behandling.status === RessursStatus.SUKSESS) {
                        avbrytEndringAvUtbetalingsperiode();
                        settÅpenBehandling(behandling);
                    }
                }
            );
        }
    };

    const slettEndretUtbetaling = () => {
        request<undefined, IBehandling>({
            method: 'DELETE',
            url: `/familie-ks-sak/api/endretutbetalingandel/${åpenBehandling.behandlingId}/${endretUtbetalingAndel.id}`,
            påvirkerSystemLaster: true,
        }).then((behandling: Ressurs<IBehandling>) => settÅpenBehandling(behandling));
    };

    return {
        endretUtbetalingAndel,
        skjema,
        settFelterTilDefault,
        skjemaHarEndringerSomIkkeErLagret,
        oppdaterEndretUtbetaling,
        slettEndretUtbetaling,
    };
};
