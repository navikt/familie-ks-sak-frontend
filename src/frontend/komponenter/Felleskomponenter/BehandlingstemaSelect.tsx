import React from 'react';

import { Select, type SelectProps } from '@navikt/ds-react';
import type { Felt } from '@navikt/familie-skjema';

import { useApp } from '../../context/AppContext';
import type { Behandlingstema, IBehandlingstema } from '../../typer/behandlingstema';
import { BehandlingKategori, behandlingstemaer } from '../../typer/behandlingstema';
import { ToggleNavn } from '../../typer/toggles';

interface EgneProps {
    behandlingstema: Felt<IBehandlingstema | undefined>;
    visFeilmeldinger?: boolean;
}

type Props = EgneProps & Omit<SelectProps, 'children'>;

export const BehandlingstemaSelect = ({
    behandlingstema,
    visFeilmeldinger = false,
    ...selectProps
}: Props) => {
    const { toggles } = useApp();
    const { verdi } = behandlingstema;
    return (
        <Select
            {...selectProps}
            {...behandlingstema.hentNavInputProps(visFeilmeldinger)}
            value={verdi !== undefined ? verdi.id : ''}
            onChange={evt => {
                behandlingstema.validerOgSettFelt(
                    behandlingstemaer[evt.target.value as Behandlingstema]
                );
            }}
        >
            {verdi === undefined && (
                <option
                    disabled
                    key={'behandlingstema-select-disabled'}
                    value={''}
                    aria-selected={true}
                >
                    Velg behandlingstema
                </option>
            )}
            {Object.values(behandlingstemaer).map(tema => {
                return (
                    <option
                        key={tema.id}
                        aria-selected={verdi !== undefined && verdi.id === tema.id}
                        value={tema.id}
                        disabled={
                            tema.kategori === BehandlingKategori.EØS && !toggles[ToggleNavn.brukEøs]
                        }
                    >
                        {tema.navn}
                    </option>
                );
            })}
        </Select>
    );
};
