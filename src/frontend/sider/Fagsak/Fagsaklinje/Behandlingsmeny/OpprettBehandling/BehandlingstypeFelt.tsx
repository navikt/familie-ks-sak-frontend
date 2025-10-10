import type { ChangeEvent } from 'react';

import { Select } from '@navikt/ds-react';
import type { Felt } from '@navikt/familie-skjema';

import { kanOppretteFørstegangsbehandling, kanOppretteRevurdering } from './opprettBehandlingUtils';
import { useAppContext } from '../../../../../context/AppContext';
import { Behandlingstype } from '../../../../../typer/behandling';
import type { IMinimalFagsak } from '../../../../../typer/fagsak';
import { Klagebehandlingstype } from '../../../../../typer/klage';
import { Tilbakekrevingsbehandlingstype } from '../../../../../typer/tilbakekrevingsbehandling';
import { ToggleNavn } from '../../../../../typer/toggles';
import { hentAktivBehandlingPåMinimalFagsak } from '../../../../../utils/fagsak';
import type { VisningBehandling } from '../../../Saksoversikt/visningBehandling';

interface IProps {
    behandlingstype: Felt<Behandlingstype | Tilbakekrevingsbehandlingstype | Klagebehandlingstype | ''>;
    visFeilmeldinger: boolean;
    minimalFagsak?: IMinimalFagsak;
    erLesevisning?: boolean;
    manuellJournalfør?: boolean;
}

interface BehandlingstypeSelect extends HTMLSelectElement {
    value: Behandlingstype | '';
}

const BehandlingstypeFelt = ({
    behandlingstype,
    visFeilmeldinger,
    minimalFagsak,
    erLesevisning = false,
    manuellJournalfør = false,
}: IProps) => {
    const { toggles } = useAppContext();

    const aktivBehandling: VisningBehandling | undefined = minimalFagsak
        ? hentAktivBehandlingPåMinimalFagsak(minimalFagsak)
        : undefined;

    const kanOppretteTekniskEndring =
        kanOppretteRevurdering(minimalFagsak, aktivBehandling) && toggles[ToggleNavn.kanBehandleTekniskEndring];

    const kanOppretteTilbakekreving = !manuellJournalfør;

    return (
        <Select
            {...behandlingstype.hentNavBaseSkjemaProps(visFeilmeldinger)}
            readOnly={erLesevisning}
            name={'Behandling'}
            label={'Velg type behandling'}
            onChange={(event: ChangeEvent<BehandlingstypeSelect>): void => {
                behandlingstype.onChange(event.target.value);
            }}
        >
            <option disabled={true} value={''}>
                Velg
            </option>
            {kanOppretteFørstegangsbehandling(minimalFagsak, aktivBehandling) && (
                <option
                    aria-selected={behandlingstype.verdi === Behandlingstype.FØRSTEGANGSBEHANDLING}
                    value={Behandlingstype.FØRSTEGANGSBEHANDLING}
                >
                    Førstegangsbehandling
                </option>
            )}
            {kanOppretteRevurdering(minimalFagsak, aktivBehandling) && (
                <option
                    aria-selected={behandlingstype.verdi === Behandlingstype.REVURDERING}
                    value={Behandlingstype.REVURDERING}
                >
                    Revurdering
                </option>
            )}

            {kanOppretteTekniskEndring && (
                <option
                    aria-selected={behandlingstype.verdi === Behandlingstype.TEKNISK_ENDRING}
                    value={Behandlingstype.TEKNISK_ENDRING}
                >
                    Teknisk endring
                </option>
            )}

            {kanOppretteTilbakekreving && (
                <option
                    aria-selected={behandlingstype.verdi === Tilbakekrevingsbehandlingstype.TILBAKEKREVING}
                    value={Tilbakekrevingsbehandlingstype.TILBAKEKREVING}
                >
                    Tilbakekreving
                </option>
            )}
            <option
                aria-selected={behandlingstype.verdi === Klagebehandlingstype.KLAGE}
                value={Klagebehandlingstype.KLAGE}
            >
                Klage
            </option>
        </Select>
    );
};

export default BehandlingstypeFelt;
