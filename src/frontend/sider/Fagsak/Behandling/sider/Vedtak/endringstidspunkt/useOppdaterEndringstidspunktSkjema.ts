import { useEffect } from 'react';

import { useFelt, useSkjema } from '@navikt/familie-skjema';

import type { IBehandling } from '../../../../../../typer/behandling';
import type { IsoDatoString } from '../../../../../../utils/dato';
import { validerGyldigDato } from '../../../../../../utils/dato';

export const useOppdaterEndringstidspunktSkjema = (
    endringstidspunkt: IsoDatoString | undefined
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
