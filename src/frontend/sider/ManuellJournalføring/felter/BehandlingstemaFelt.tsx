import { Select } from '@navikt/ds-react';
import { useManuellJournalføringContext } from '@sider/ManuellJournalføring/ManuellJournalføringContext';
import type { Behandlingstema } from '@typer/behandlingstema';
import { behandlingstemaer } from '@typer/behandlingstema';

interface BehandlingstemaFeltProps {
    erLesevisning: boolean;
}

export function BehandlingstemaFelt({ erLesevisning }: BehandlingstemaFeltProps) {
    const { skjema } = useManuellJournalføringContext();
    const { verdi } = skjema.felter.behandlingstema;

    return (
        <Select
            {...skjema.felter.behandlingstema.hentNavInputProps(skjema.visFeilmeldinger)}
            label={'Velg behandlingstema'}
            value={verdi !== undefined ? verdi.id : ''}
            onChange={evt => {
                skjema.felter.behandlingstema.validerOgSettFelt(behandlingstemaer[evt.target.value as Behandlingstema]);
            }}
            readOnly={erLesevisning}
        >
            <option disabled key={'behandlingstema-select-disabled'} value={''} aria-selected={true}>
                Velg behandlingstema
            </option>
            {Object.values(behandlingstemaer).map(tema => {
                return (
                    <option key={tema.id} aria-selected={verdi !== undefined && verdi.id === tema.id} value={tema.id}>
                        {tema.navn}
                    </option>
                );
            })}
        </Select>
    );
}
