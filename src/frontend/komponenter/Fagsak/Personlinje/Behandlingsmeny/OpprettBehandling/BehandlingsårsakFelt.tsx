import React from 'react';

import { Select } from '@navikt/ds-react';
import type { Felt } from '@navikt/familie-skjema';

import { useApp } from '../../../../../context/AppContext';
import { behandlingÅrsak, BehandlingÅrsak } from '../../../../../typer/behandling';
import { ToggleNavn } from '../../../../../typer/toggles';

interface BehandlingÅrsakSelect extends HTMLSelectElement {
    value: BehandlingÅrsak | '';
}

interface IProps {
    behandlingsårsak: Felt<BehandlingÅrsak | ''>;
    visFeilmeldinger: boolean;
    erLesevisning?: boolean;
}

export const BehandlingårsakFelt: React.FC<IProps> = ({
    behandlingsårsak,
    visFeilmeldinger,
    erLesevisning = false,
}) => {
    const { toggles } = useApp();

    return (
        <Select
            {...behandlingsårsak.hentNavBaseSkjemaProps(visFeilmeldinger)}
            readOnly={erLesevisning}
            name={'Behandlingsårsak'}
            label={'Velg årsak'}
            onChange={(event: React.ChangeEvent<BehandlingÅrsakSelect>): void => {
                behandlingsårsak.onChange(event.target.value);
            }}
        >
            <option disabled={true} value={''}>
                Velg
            </option>
            {Object.values(BehandlingÅrsak)
                .filter(
                    årsak =>
                        årsak !== BehandlingÅrsak.SATSENDRING &&
                        (årsak !== BehandlingÅrsak.KORREKSJON_VEDTAKSBREV ||
                            toggles[ToggleNavn.kanManueltKorrigereMedVedtaksbrev])
                )
                .filter(årsak => årsak !== BehandlingÅrsak.LOVENDRING_2024)
                .filter(
                    årsak =>
                        toggles[ToggleNavn.overgangsordningErTilgjengelig] ||
                        årsak !== BehandlingÅrsak.OVERGANGSORDNING_2024
                )
                .map(årsak => {
                    return (
                        <option
                            key={årsak}
                            aria-selected={behandlingsårsak.verdi === årsak}
                            value={årsak}
                        >
                            {behandlingÅrsak[årsak]}
                        </option>
                    );
                })}
        </Select>
    );
};
