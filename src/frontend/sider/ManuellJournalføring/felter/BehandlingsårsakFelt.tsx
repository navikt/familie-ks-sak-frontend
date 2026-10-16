import { Select } from '@navikt/ds-react';
import { useManuellJournalføringContext } from '@sider/ManuellJournalføring/ManuellJournalføringContext';
import { type BehandlingÅrsak, behandlingÅrsak } from '@typer/behandling';
import { hentTilgjengeligeBehandlingsårsaker } from '@utils/behandling';

interface IProps {
    erLesevisning: boolean;
}

export function BehandlingårsakFelt({ erLesevisning }: IProps) {
    const { skjema } = useManuellJournalføringContext();

    return (
        <Select
            {...skjema.felter.behandlingsårsak.hentNavBaseSkjemaProps(skjema.visFeilmeldinger)}
            readOnly={erLesevisning}
            name={'Behandlingsårsak'}
            label={'Velg årsak'}
            onChange={event => {
                skjema.felter.behandlingsårsak.onChange(event.target.value as BehandlingÅrsak);
            }}
        >
            <option disabled={true} value={''}>
                Velg
            </option>
            {hentTilgjengeligeBehandlingsårsaker().map(årsak => {
                return (
                    <option key={årsak} aria-selected={skjema.felter.behandlingsårsak.verdi === årsak} value={årsak}>
                        {behandlingÅrsak[årsak]}
                    </option>
                );
            })}
        </Select>
    );
}
