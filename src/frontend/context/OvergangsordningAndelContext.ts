import { useState } from 'react';

import createUseContext from 'constate';
import deepEqual from 'deep-equal';

import { useHttp } from '@navikt/familie-http';
import { feil, ok, useFelt, useSkjema } from '@navikt/familie-skjema';
import { type Ressurs, RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from './behandlingContext/BehandlingContext';
import type { IBehandling } from '../typer/behandling';
import type {
    IRestOvergangsordningAndel,
    IRestOvergangsordningAndelSkjemaFelt,
} from '../typer/overgangsordningAndel';
import { dateTilIsoMånedÅrString, validerGyldigDato } from '../utils/dato';
import { isNumeric } from '../utils/eøsValidators';

interface IProps {
    overgangsordningAndel: IRestOvergangsordningAndel;
}

const [OvergangsordningAndelProvider, useOvergangsordningAndel] = createUseContext(
    ({ overgangsordningAndel }: IProps) => {
        const { request } = useHttp();
        const { åpenBehandling, settÅpenBehandling } = useBehandling();

        const behandlingId =
            åpenBehandling.status === RessursStatus.SUKSESS
                ? åpenBehandling.data.behandlingId
                : null;

        const { skjema, kanSendeSkjema, onSubmit, nullstillSkjema } = useSkjema<
            IRestOvergangsordningAndelSkjemaFelt,
            IBehandling
        >({
            felter: {
                personIdent: useFelt<string | undefined>({
                    verdi: overgangsordningAndel.personIdent,
                    valideringsfunksjon: felt =>
                        felt.verdi ? ok(felt) : feil(felt, 'Du må velge en person'),
                }),
                antallTimer: useFelt<string | undefined>({
                    verdi: overgangsordningAndel.antallTimer?.toString(),
                    valideringsfunksjon: felt => {
                        if (felt.verdi === undefined) {
                            return ok(felt);
                        }
                        if (!isNumeric(felt.verdi)) {
                            return feil(felt, 'Antall timer må være et tall');
                        }
                        if (Number(felt.verdi) < 0) {
                            return feil(felt, 'Antall timer må være 0 eller større');
                        }
                        return ok(felt);
                    },
                }),
                deltBosted: useFelt<boolean>({
                    verdi: overgangsordningAndel.deltBosted,
                }),
                fom: useFelt<Date | undefined>({
                    verdi: overgangsordningAndel.fom
                        ? new Date(overgangsordningAndel.fom)
                        : undefined,
                    valideringsfunksjon: validerGyldigDato,
                }),
                tom: useFelt<Date | undefined>({
                    verdi: overgangsordningAndel.tom
                        ? new Date(overgangsordningAndel.tom)
                        : undefined,
                    valideringsfunksjon: validerGyldigDato,
                }),
            },
            skjemanavn: 'Endre overgangsandelperiode',
        });

        const [erOvergangsordningAndelÅpen, settErOvergangsordningAndelÅpen] = useState<boolean>(
            overgangsordningAndel.personIdent === null
        );

        const hentSkjemaData = () => {
            const { personIdent, antallTimer, deltBosted, fom, tom } = skjema.felter;
            return {
                id: overgangsordningAndel.id,
                personIdent: personIdent && personIdent.verdi,
                antallTimer: antallTimer && Number(antallTimer.verdi),
                deltBosted: deltBosted.verdi,
                fom: fom && dateTilIsoMånedÅrString(fom.verdi),
                tom: tom && dateTilIsoMånedÅrString(tom.verdi),
            };
        };

        const tilbakestillOgLukkOvergangsordningAndel = () => {
            settErOvergangsordningAndelÅpen(false);
            nullstillSkjema();
        };

        const oppdaterOvergangsordningAndel = () => {
            if (kanSendeSkjema()) {
                onSubmit<IRestOvergangsordningAndel>(
                    {
                        method: 'PUT',
                        url: `/familie-ks-sak/api/overgangsordningandel/${behandlingId}/${overgangsordningAndel.id}`,
                        påvirkerSystemLaster: true,
                        data: hentSkjemaData(),
                    },
                    (behandling: Ressurs<IBehandling>) => {
                        if (behandling.status === RessursStatus.SUKSESS) {
                            tilbakestillOgLukkOvergangsordningAndel();
                            settÅpenBehandling(behandling);
                        }
                    }
                );
            }
        };

        const slettOvergangsordningAndel = () => {
            request<undefined, IBehandling>({
                method: 'DELETE',
                url: `/familie-ks-sak/api/overgangsordningandel/${behandlingId}/${overgangsordningAndel.id}`,
                påvirkerSystemLaster: true,
            }).then((behandling: Ressurs<IBehandling>) => settÅpenBehandling(behandling));
        };

        const erOvergangsordningAndelForandret = () =>
            !deepEqual(overgangsordningAndel, hentSkjemaData());

        return {
            overgangsordningAndel,
            skjema,
            erOvergangsordningAndelÅpen,
            settErOvergangsordningAndelÅpen,
            erOvergangsordningAndelForandret,
            slettOvergangsordningAndel,
            oppdaterOvergangsordningAndel,
            tilbakestillOgLukkOvergangsordningAndel,
        };
    }
);

export { OvergangsordningAndelProvider, useOvergangsordningAndel };
