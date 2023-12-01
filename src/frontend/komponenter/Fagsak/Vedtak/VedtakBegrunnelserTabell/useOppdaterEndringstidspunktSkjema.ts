import { useEffect } from 'react';

import type { ISODateString } from '@navikt/familie-datovelger';
import { useFelt, useSkjema } from '@navikt/familie-skjema';

import type { IBehandling } from '../../../../typer/behandling';
import { validerGyldigDato } from '../../../../utils/dato';

export const useOppdaterEndringstidspunktSkjema = (
    endringstidspunkt: ISODateString | undefined,
    modalVises: boolean
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
        if (modalVises && endringstidspunkt) {
            oppdaterEndringstidspunktSkjema.skjema.felter.endringstidspunkt.validerOgSettFelt(
                new Date(endringstidspunkt)
            );
        } else {
            oppdaterEndringstidspunktSkjema.nullstillSkjema();
        }
    }, [modalVises]);

    return oppdaterEndringstidspunktSkjema;
};
