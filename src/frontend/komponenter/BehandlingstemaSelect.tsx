import React from 'react';

import { Select, type SelectProps } from '@navikt/ds-react';
import type { Felt } from '@navikt/familie-skjema';

import type { Behandlingstema, IBehandlingstema } from '../typer/behandlingstema';
import { behandlingstemaer } from '../typer/behandlingstema';

interface EgneProps {
    behandlingstema: Felt<IBehandlingstema | undefined>;
    visFeilmeldinger?: boolean;
}

type Props = EgneProps & Omit<SelectProps, 'children'>;

export const BehandlingstemaSelect = ({ behandlingstema, visFeilmeldinger = false, ...selectProps }: Props) => {
    const { verdi } = behandlingstema;
    return (
        <Select
            {...selectProps}
            {...behandlingstema.hentNavInputProps(visFeilmeldinger)}
            value={verdi !== undefined ? verdi.id : ''}
            onChange={evt => {
                behandlingstema.validerOgSettFelt(behandlingstemaer[evt.target.value as Behandlingstema]);
            }}
        >
            {verdi === undefined && (
                <option disabled key={'behandlingstema-select-disabled'} value={''} aria-selected={true}>
                    Velg behandlingstema
                </option>
            )}
            {Object.values(behandlingstemaer).map(tema => {
                return (
                    <option key={tema.id} aria-selected={verdi !== undefined && verdi.id === tema.id} value={tema.id}>
                        {tema.navn}
                    </option>
                );
            })}
        </Select>
    );
};
