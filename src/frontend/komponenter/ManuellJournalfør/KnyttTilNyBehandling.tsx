import React from 'react';

import classNames from 'classnames';
import styled from 'styled-components';

import { BodyShort, Checkbox, Fieldset, Heading } from '@navikt/ds-react';

import { useManuellJournalfør } from '../../context/ManuellJournalførContext';
import BehandlingstypeFelt from '../Fagsak/Personlinje/Behandlingsmeny/OpprettBehandling/BehandlingstypeFelt';
import { BehandlingårsakFelt } from '../Fagsak/Personlinje/Behandlingsmeny/OpprettBehandling/BehandlingsårsakFelt';
import { BehandlingstemaSelect } from '../Felleskomponenter/BehandlingstemaSelect';

const StyledCheckboxDiv = styled.div`
    width: 20rem;
`;

/**
 * Legger inn lesevisning slik at på sikt
 * så kan man kanskje sjekke hvilken behandling
 * journalposten er journalført på slik at man kan klikke seg inn på behandlingen
 */
export const KnyttTilNyBehandling: React.FC = () => {
    const { skjema, minimalFagsak, kanKnytteJournalpostTilBehandling } = useManuellJournalfør();
    const { knyttTilNyBehandling, behandlingstype, behandlingstema } = skjema.felter;
    return (
        <Fieldset legend="Knytt til ny behandling" hideLegend>
            <Heading size={'small'} level={'2'}>
                Knytt til ny behandling
            </Heading>
            <StyledCheckboxDiv>
                {!kanKnytteJournalpostTilBehandling() ? (
                    knyttTilNyBehandling.verdi ? (
                        <BodyShort
                            className={classNames('skjemaelement', 'lese-felt')}
                            children={'Knytt til ny behandling'}
                        />
                    ) : null
                ) : (
                    <Checkbox
                        id={knyttTilNyBehandling.id}
                        value={'Knytt til ny behandling'}
                        checked={knyttTilNyBehandling.verdi}
                        onChange={() => {
                            knyttTilNyBehandling.validerOgSettFelt(!knyttTilNyBehandling.verdi);
                        }}
                    >
                        {'Knytt til ny behandling'}
                    </Checkbox>
                )}
            </StyledCheckboxDiv>
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
                    erLesevisning={!kanKnytteJournalpostTilBehandling()}
                    visFeilmeldinger={skjema.visFeilmeldinger}
                    name="Behandlingstema"
                    label="Velg behandlingstema"
                />
            )}
        </Fieldset>
    );
};
