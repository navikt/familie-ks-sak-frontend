import { useEffect } from 'react';

import type { ISODateString } from '@navikt/familie-datovelger';
import { useFelt, useSkjema } from '@navikt/familie-skjema';

import type { IBehandling } from '../../../../typer/behandling';
import { validerGyldigDato } from '../../../../utils/dato';

export const useOppdaterEndringstidspunktSkjema = (
    endringstidspunkt: ISODateString | undefined
) => {
    const oppdaterEndringstidspunktSkjema = useSkjema<
        {
            endringstidspunkt: Date | undefined;
        },
        IBehandling
    >({
        felter: {
            endringstidspunkt: useFelt<Date | undefined>({
                verdi: undefined,
                valideringsfunksjon: validerGyldigDato,
            }),
        },
        skjemanavn: 'Oppdater første endringstidspunkt',
    });

    useEffect(() => {
        if (endringstidspunkt) {
            oppdaterEndringstidspunktSkjema.skjema.felter.endringstidspunkt.validerOgSettFelt(
                new Date(endringstidspunkt)
            );
        } else {
            oppdaterEndringstidspunktSkjema.nullstillSkjema();
        }
    }, []);

    return oppdaterEndringstidspunktSkjema;
};
