import { useFagsak } from '@hooks/useFagsak';
import { useFeatureToggles } from '@hooks/useFeatureToggles';
import {
    OpprettBehandlingFelt,
    type OpprettBehandlingFormValues,
} from '@komponenter/Saklinje/Meny/OpprettBehandling/useOpprettBehandlingSkjema';
import { Behandlingstype, BehandlingÅrsak } from '@typer/behandling';
import { FeatureToggle } from '@typer/featureToggles';
import { Klagebehandlingstype } from '@typer/klage';
import { Tilbakekrevingsbehandlingstype } from '@typer/tilbakekrevingsbehandling';
import { hentAktivBehandlingPåMinimalFagsak } from '@utils/fagsak';
import { useController, useFormContext } from 'react-hook-form';

import { Select } from '@navikt/ds-react';

import { kanOppretteFørstegangsbehandling, kanOppretteRevurdering } from '../opprettBehandlingUtils';

export function BehandlingstypeFelt() {
    const toggles = useFeatureToggles();

    const fagsak = useFagsak();

    const { control, setValue, reset } = useFormContext<OpprettBehandlingFormValues>();

    const {
        field: { value, onChange },
        fieldState: { error },
        formState: { isSubmitting },
    } = useController({
        name: OpprettBehandlingFelt.BEHANDLINGSTYPE,
        control,
        rules: {
            required: 'Velg type behandling som skal opprettes fra nedtrekkslisten.',
        },
    });

    const aktivBehandling = fagsak ? hentAktivBehandlingPåMinimalFagsak(fagsak) : undefined;

    const kanOppretteTekniskEndring =
        kanOppretteRevurdering(fagsak, aktivBehandling) && toggles[FeatureToggle.kanBehandleTekniskEndring];

    function handleOnChange(event: React.ChangeEvent<HTMLSelectElement>) {
        reset();

        const nyVerdi = event.target.value;
        onChange(nyVerdi);

        if (nyVerdi === Behandlingstype.FØRSTEGANGSBEHANDLING) {
            setValue(OpprettBehandlingFelt.BEHANDLINGSÅRSAK, BehandlingÅrsak.SØKNAD);
        } else if (nyVerdi === Behandlingstype.TEKNISK_ENDRING) {
            setValue(OpprettBehandlingFelt.BEHANDLINGSÅRSAK, BehandlingÅrsak.TEKNISK_ENDRING);
        }
    }

    return (
        <Select
            label={'Velg type behandling'}
            readOnly={isSubmitting}
            value={value}
            onChange={handleOnChange}
            error={error?.message}
        >
            <option disabled={true} value={''}>
                Velg
            </option>
            {kanOppretteFørstegangsbehandling(fagsak, aktivBehandling) && (
                <option
                    aria-selected={value === Behandlingstype.FØRSTEGANGSBEHANDLING}
                    value={Behandlingstype.FØRSTEGANGSBEHANDLING}
                >
                    Førstegangsbehandling
                </option>
            )}
            {kanOppretteRevurdering(fagsak, aktivBehandling) && (
                <option aria-selected={value === Behandlingstype.REVURDERING} value={Behandlingstype.REVURDERING}>
                    Revurdering
                </option>
            )}

            {kanOppretteTekniskEndring && (
                <option
                    aria-selected={value === Behandlingstype.TEKNISK_ENDRING}
                    value={Behandlingstype.TEKNISK_ENDRING}
                >
                    Teknisk endring
                </option>
            )}

            <option
                aria-selected={value === Tilbakekrevingsbehandlingstype.TILBAKEKREVING}
                value={Tilbakekrevingsbehandlingstype.TILBAKEKREVING}
            >
                Tilbakekreving
            </option>
            {!fagsak.finnesStrengtFortroligPersonIFagsak && (
                <option aria-selected={value === Klagebehandlingstype.KLAGE} value={Klagebehandlingstype.KLAGE}>
                    Klage
                </option>
            )}
        </Select>
    );
}
