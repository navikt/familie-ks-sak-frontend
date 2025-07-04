import React from 'react';

import styled from 'styled-components';

import { Checkbox, Fieldset, Heading } from '@navikt/ds-react';
import { ASpacing8 } from '@navikt/ds-tokens/dist/tokens';

import { useManuellJournalføringContext } from './ManuellJournalføringContext';
import { BehandlingstemaSelect } from '../../komponenter/BehandlingstemaSelect';
import BehandlingstypeFelt from '../Fagsak/Personlinje/Behandlingsmeny/OpprettBehandling/BehandlingstypeFelt';
import { BehandlingårsakFelt } from '../Fagsak/Personlinje/Behandlingsmeny/OpprettBehandling/BehandlingsårsakFelt';

const StyledFieldset = styled(Fieldset)`
    margin-top: ${ASpacing8};
`;

/**
 * Legger inn lesevisning slik at på sikt
 * så kan man kanskje sjekke hvilken behandling
 * journalposten er journalført på slik at man kan klikke seg inn på behandlingen
 */
export const KnyttTilNyBehandling: React.FC = () => {
    const { skjema, minimalFagsak, kanKnytteJournalpostTilBehandling } =
        useManuellJournalføringContext();
    const { knyttTilNyBehandling, behandlingstype, behandlingstema } = skjema.felter;
    return (
        <StyledFieldset legend="Knytt til ny behandling" hideLegend>
            <Heading size={'small'} level={'2'}>
                Knytt til ny behandling
            </Heading>
            <Checkbox
                id={knyttTilNyBehandling.id}
                value={'Knytt til ny behandling'}
                checked={knyttTilNyBehandling.verdi}
                onChange={() => {
                    knyttTilNyBehandling.validerOgSettFelt(!knyttTilNyBehandling.verdi);
                }}
                readOnly={!kanKnytteJournalpostTilBehandling()}
            >
                {'Knytt til ny behandling'}
            </Checkbox>
            {behandlingstype.erSynlig && (
                <BehandlingstypeFelt
                    behandlingstype={skjema.felter.behandlingstype}
                    visFeilmeldinger={skjema.visFeilmeldinger}
                    minimalFagsak={minimalFagsak}
                    erLesevisning={!kanKnytteJournalpostTilBehandling()}
                    manuellJournalfør
                />
            )}

            {skjema.felter.behandlingsårsak.erSynlig && (
                <BehandlingårsakFelt
                    behandlingsårsak={skjema.felter.behandlingsårsak}
                    visFeilmeldinger={skjema.visFeilmeldinger}
                    erLesevisning={!kanKnytteJournalpostTilBehandling()}
                />
            )}

            {behandlingstema.erSynlig && (
                <BehandlingstemaSelect
                    behandlingstema={behandlingstema}
                    readOnly={!kanKnytteJournalpostTilBehandling()}
                    visFeilmeldinger={skjema.visFeilmeldinger}
                    name="Behandlingstema"
                    label="Velg behandlingstema"
                />
            )}
        </StyledFieldset>
    );
};
