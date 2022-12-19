import React from 'react';

import { FamilieSelect } from '@navikt/familie-form-elements';
import type { Felt } from '@navikt/familie-skjema';

import { useApp } from '../../../../../context/AppContext';
import { Behandlingstype } from '../../../../../typer/behandling';
import type { IMinimalFagsak } from '../../../../../typer/fagsak';
import { Tilbakekrevingsbehandlingstype } from '../../../../../typer/tilbakekrevingsbehandling';
import { ToggleNavn } from '../../../../../typer/toggles';
import { hentAktivBehandlingPåMinimalFagsak } from '../../../../../utils/fagsak';
import type { VisningBehandling } from '../../../Saksoversikt/visningBehandling';
import { kanOppretteFørstegangsbehandling, kanOppretteRevurdering } from './opprettBehandlingUtils';

interface IProps {
    behandlingstype: Felt<Behandlingstype | Tilbakekrevingsbehandlingstype | ''>;
    visFeilmeldinger: boolean;
    minimalFagsak?: IMinimalFagsak;
    erLesevisning?: boolean;
    manuellJournalfør?: boolean;
}

interface BehandlingstypeSelect extends HTMLSelectElement {
    value: Behandlingstype | '';
}

const BehandlingstypeFelt: React.FC<IProps> = ({
    behandlingstype,
    visFeilmeldinger,
    minimalFagsak,
    erLesevisning = false,
    manuellJournalfør = false,
}) => {
    const { toggles } = useApp();

    const aktivBehandling: VisningBehandling | undefined = minimalFagsak
        ? hentAktivBehandlingPåMinimalFagsak(minimalFagsak)
        : undefined;

    const kanOppretteTekniskEndring =
        kanOppretteRevurdering(minimalFagsak, aktivBehandling) &&
        toggles[ToggleNavn.kanBehandleTekniskEndring];

    const kanOppretteTilbakekreving = !manuellJournalfør;

    return (
        <FamilieSelect
            {...behandlingstype.hentNavBaseSkjemaProps(visFeilmeldinger)}
            erLesevisning={erLesevisning}
            name={'Behandling'}
            label={'Velg type behandling'}
            onChange={(event: React.ChangeEvent<BehandlingstypeSelect>): void => {
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
                    aria-selected={
                        behandlingstype.verdi === Tilbakekrevingsbehandlingstype.TILBAKEKREVING
                    }
                    value={Tilbakekrevingsbehandlingstype.TILBAKEKREVING}
                >
                    Tilbakekreving
                </option>
            )}

            {toggles[ToggleNavn.kanBehandleKlage] && (
                <option
                    aria-selected={behandlingstype.verdi === Behandlingstype.KLAGE}
                    value={Behandlingstype.KLAGE}
                >
                    Klage
                </option>
            )}
        </FamilieSelect>
    );
};

export default BehandlingstypeFelt;
