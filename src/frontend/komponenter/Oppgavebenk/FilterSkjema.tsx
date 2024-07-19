import React from 'react';

import styled from 'styled-components';

import { Button, Fieldset, HStack, Select } from '@navikt/ds-react';
import { Valideringsstatus } from '@navikt/familie-skjema';
import { RessursStatus } from '@navikt/familie-typer';

import type { IOppgaveFelt } from './oppgavefelter';
import { useApp } from '../../context/AppContext';
import { useOppgaver } from '../../context/OppgaverContext';
import type { IPar } from '../../typer/common';
import type { IsoDatoString } from '../../utils/dato';
import DatovelgerForGammelSkjemaløsning from '../Felleskomponenter/Datovelger/DatovelgerForGammelSkjemaløsning';

const DatoVelgerContainer = styled.div`
    max-width: 12.5rem;
`;

// Denne stylingen skal fjernes på sikt (minus marginer)
const StyledButton = styled(Button)`
    margin-top: 0.5rem;
    margin-right: 1.5rem;
    padding: calc(0.25rem - 1px) 1.5rem calc(0.25rem - 1px) 1.5rem;
    font-weight: bolder;
    min-height: 2rem;
    .navds-button__inner {
        font-weight: 600;
        letter-spacing: 0.0625em;
    }
`;

const StyledFieldset = styled(Fieldset)`
    margin-bottom: 2rem;
`;

const FilterSkjema: React.FunctionComponent = () => {
    const { innloggetSaksbehandler } = useApp();
    const {
        hentOppgaver,
        oppgaver,
        oppgaveFelter,
        settVerdiPåOppgaveFelt,
        tilbakestillOppgaveFelter,
        validerSkjema,
    } = useOppgaver();

    return (
        <StyledFieldset legend={'Oppgavebenken filterskjema'} hideLegend>
            <HStack gap="6">
                {Object.values(oppgaveFelter)
                    .filter((oppgaveFelt: IOppgaveFelt) => oppgaveFelt.filter)
                    .map((oppgaveFelt: IOppgaveFelt) => {
                        switch (oppgaveFelt.filter?.type) {
                            case 'dato':
                                return (
                                    <DatoVelgerContainer key={oppgaveFelt.nøkkel}>
                                        <DatovelgerForGammelSkjemaløsning
                                            key={oppgaveFelt.nøkkel}
                                            label={oppgaveFelt.label}
                                            onDateChange={(dato?: IsoDatoString) => {
                                                settVerdiPåOppgaveFelt(
                                                    oppgaveFelt,
                                                    dato ? dato : ''
                                                );
                                            }}
                                            value={oppgaveFelt.filter.selectedValue}
                                            visFeilmeldinger={
                                                oppgaveFelt.valideringsstatus ===
                                                Valideringsstatus.FEIL
                                            }
                                            feilmelding={oppgaveFelt.feilmelding}
                                        />
                                    </DatoVelgerContainer>
                                );
                            case 'select':
                                return (
                                    <div>
                                        <Select
                                            label={oppgaveFelt.label}
                                            onChange={event =>
                                                settVerdiPåOppgaveFelt(
                                                    oppgaveFelt,
                                                    event.target.value
                                                )
                                            }
                                            key={oppgaveFelt.nøkkel}
                                            value={oppgaveFelt.filter.selectedValue}
                                            error={
                                                oppgaveFelt.valideringsstatus ===
                                                Valideringsstatus.FEIL
                                                    ? oppgaveFelt.feilmelding
                                                    : undefined
                                            }
                                            data-cy={`select-${oppgaveFelt.label}`}
                                        >
                                            {oppgaveFelt.filter.nøkkelPar &&
                                                Object.values(oppgaveFelt.filter.nøkkelPar)
                                                    .filter((par: IPar) =>
                                                        oppgaveFelt.erSynlig
                                                            ? oppgaveFelt.erSynlig(
                                                                  par,
                                                                  innloggetSaksbehandler
                                                              )
                                                            : true
                                                    )
                                                    .map((par: IPar) => {
                                                        return (
                                                            <option
                                                                aria-selected={
                                                                    oppgaveFelt.filter &&
                                                                    oppgaveFelt.filter
                                                                        .selectedValue === par.id
                                                                }
                                                                key={par.id}
                                                                value={par.id}
                                                            >
                                                                {par.navn}
                                                            </option>
                                                        );
                                                    })}
                                        </Select>
                                    </div>
                                );
                            default:
                                return null;
                        }
                    })}
            </HStack>

            <div>
                <StyledButton
                    variant="primary"
                    onClick={() => {
                        validerSkjema() && hentOppgaver();
                    }}
                    loading={oppgaver.status === RessursStatus.HENTER}
                    disabled={oppgaver.status === RessursStatus.HENTER}
                    children={'Hent oppgaver'}
                />
                <StyledButton
                    onClick={tilbakestillOppgaveFelter}
                    variant="secondary"
                    children={'Tilbakestill filtrering'}
                />
            </div>
        </StyledFieldset>
    );
};

export default FilterSkjema;
