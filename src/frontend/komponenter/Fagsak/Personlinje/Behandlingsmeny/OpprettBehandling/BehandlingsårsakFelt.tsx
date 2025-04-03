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

    const behandlingÅrsakerSomIkkeSkalSettesManuelt = [
        BehandlingÅrsak.KLAGE,
        BehandlingÅrsak.LOVENDRING_2024,
        BehandlingÅrsak.SATSENDRING,
        toggles[ToggleNavn.kanOppretteRevurderingMedAarsakIverksetteKaVedtak]
            ? null
            : BehandlingÅrsak.IVERKSETTE_KA_VEDTAK,
        toggles[ToggleNavn.kanManueltKorrigereMedVedtaksbrev]
            ? null
            : BehandlingÅrsak.KORREKSJON_VEDTAKSBREV,
    ].filter(behandlingsårsak => behandlingsårsak != null);

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
                    behandlingsårsak =>
                        !behandlingÅrsakerSomIkkeSkalSettesManuelt.find(
                            årsak => årsak == behandlingsårsak
                        )
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
