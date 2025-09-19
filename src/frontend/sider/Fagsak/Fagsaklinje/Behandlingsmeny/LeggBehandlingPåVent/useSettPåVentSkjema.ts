import { useEffect } from 'react';

import { addDays } from 'date-fns';

import { feil, ok, useFelt, useSkjema } from '@navikt/familie-skjema';

import { hentAlleÅrsaker } from './settPåVentUtils';
import type { IBehandling, IBehandlingPåVent, SettPåVentÅrsak } from '../../../../../typer/behandling';
import { hentDagensDato, validerGyldigDato } from '../../../../../utils/dato';

const STANDARD_ANTALL_DAGER_FRIST = 3 * 7;

export const useSettPåVentSkjema = (behandlingPåVent: IBehandlingPåVent | undefined) => {
    const standardfrist = addDays(hentDagensDato(), STANDARD_ANTALL_DAGER_FRIST);
    const settPåVentFrist = behandlingPåVent?.frist ? new Date(behandlingPåVent?.frist) : undefined;

    const årsaker = hentAlleÅrsaker();

    const settPåVentSkjema = useSkjema<
        {
            frist: Date | undefined;
            årsak: SettPåVentÅrsak | undefined;
        },
        IBehandling
    >({
        felter: {
            frist: useFelt<Date | undefined>({
                verdi: undefined,
                valideringsfunksjon: validerGyldigDato,
            }),
            årsak: useFelt<SettPåVentÅrsak | undefined>({
                verdi: behandlingPåVent?.årsak ?? undefined,
                valideringsfunksjon: felt =>
                    felt.verdi === undefined || !årsaker.includes(felt.verdi)
                        ? feil(felt, 'Du må velge en årsak')
                        : ok(felt),
            }),
        },
        skjemanavn: 'Sett behandling på vent',
    });

    const fyllInnStandardverdier = () => {
        settPåVentSkjema.nullstillSkjema();
        settPåVentSkjema.skjema.felter.frist.validerOgSettFelt(standardfrist);
        settPåVentSkjema.skjema.felter.årsak.validerOgSettFelt(undefined);
    };

    useEffect(() => {
        if (behandlingPåVent) {
            settPåVentSkjema.skjema.felter.frist.validerOgSettFelt(settPåVentFrist);
            settPåVentSkjema.skjema.felter.årsak.validerOgSettFelt(behandlingPåVent.årsak);
        } else {
            fyllInnStandardverdier();
        }
    }, []);

    return settPåVentSkjema;
};
