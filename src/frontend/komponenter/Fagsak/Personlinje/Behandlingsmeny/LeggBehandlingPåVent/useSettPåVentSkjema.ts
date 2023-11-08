import { useEffect } from 'react';

import { feil, ok, useFelt, useSkjema } from '@navikt/familie-skjema';

import { hentAlleÅrsaker, validerSettPåVentFrist } from './settPåVentUtils';
import type {
    IBehandling,
    IBehandlingPåVent,
    SettPåVentÅrsak,
} from '../../../../../typer/behandling';
import type { FamilieIsoDate } from '../../../../../utils/kalender';
import {
    iDag,
    KalenderEnhet,
    leggTil,
    serializeIso8601String,
} from '../../../../../utils/kalender';

const STANDARD_ANTALL_DAGER_FRIST = 3 * 7;

export const useSettPåVentSkjema = (
    behandlingPåVent: IBehandlingPåVent | undefined,
    modalVises: boolean
) => {
    const standardfrist = serializeIso8601String(
        leggTil(iDag(), STANDARD_ANTALL_DAGER_FRIST, KalenderEnhet.DAG)
    );
    const årsaker = hentAlleÅrsaker();

    const settPåVentSkjema = useSkjema<
        {
            frist: FamilieIsoDate | undefined;
            årsak: SettPåVentÅrsak | undefined;
        },
        IBehandling
    >({
        felter: {
            frist: useFelt<FamilieIsoDate | undefined>({
                verdi: behandlingPåVent?.frist ?? standardfrist,
                valideringsfunksjon: validerSettPåVentFrist,
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
        if (modalVises && behandlingPåVent) {
            settPåVentSkjema.skjema.felter.frist.validerOgSettFelt(behandlingPåVent.frist);
            settPåVentSkjema.skjema.felter.årsak.validerOgSettFelt(behandlingPåVent.årsak);
        } else {
            fyllInnStandardverdier();
        }
    }, [modalVises]);

    return settPåVentSkjema;
};
