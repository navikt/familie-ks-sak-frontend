import React, { type JSX } from 'react';

import styled from 'styled-components';

import { Button, Fieldset, HStack, Select, VStack } from '@navikt/ds-react';
import { Valideringsstatus } from '@navikt/familie-skjema';
import { RessursStatus } from '@navikt/familie-typer';

import { useOppgavebenkContext } from './OppgavebenkContext';
import type { IOppgaveFelt } from './oppgavefelter';
import { useAppContext } from '../../context/AppContext';
import DatovelgerForGammelSkjemaløsning from '../../komponenter/Datovelger/DatovelgerForGammelSkjemaløsning';
import type { IPar } from '../../typer/common';
import type { IsoDatoString } from '../../utils/dato';

const DatoVelgerContainer = styled.div`
    max-width: 12.5rem;
`;

const FilterSkjema: React.FunctionComponent = () => {
    const { innloggetSaksbehandler } = useAppContext();
    const {
        hentOppgaver,
        oppgaver,
        oppgaveFelter,
        settVerdiPåOppgaveFelt,
        tilbakestillOppgaveFelter,
        validerSkjema,
    } = useOppgavebenkContext();

    function tilOppgaveFeltKomponent(oppgaveFelt: IOppgaveFelt): JSX.Element | null {
        switch (oppgaveFelt.filter?.type) {
            case 'dato':
                return (
                    <DatoVelgerContainer key={oppgaveFelt.nøkkel}>
                        <DatovelgerForGammelSkjemaløsning
                            key={oppgaveFelt.nøkkel}
                            label={oppgaveFelt.label}
                            onDateChange={(dato?: IsoDatoString) => {
                                settVerdiPåOppgaveFelt(oppgaveFelt, dato ? dato : '');
                            }}
                            value={oppgaveFelt.filter.selectedValue}
                            visFeilmeldinger={
                                oppgaveFelt.valideringsstatus === Valideringsstatus.FEIL
                            }
                            feilmelding={oppgaveFelt.feilmelding}
                        />
                    </DatoVelgerContainer>
                );
            case 'select':
                return (
                    <div key={oppgaveFelt.nøkkel}>
                        <Select
                            label={oppgaveFelt.label}
                            onChange={event =>
                                settVerdiPåOppgaveFelt(oppgaveFelt, event.target.value)
                            }
                            value={oppgaveFelt.filter.selectedValue}
                            error={
                                oppgaveFelt.valideringsstatus === Valideringsstatus.FEIL
                                    ? oppgaveFelt.feilmelding
                                    : undefined
                            }
                            data-cy={`select-${oppgaveFelt.label}`}
                        >
                            {oppgaveFelt.filter.nøkkelPar &&
                                Object.values(oppgaveFelt.filter.nøkkelPar)
                                    .filter((par: IPar) =>
                                        oppgaveFelt.erSynlig
                                            ? oppgaveFelt.erSynlig(par, innloggetSaksbehandler)
                                            : true
                                    )
                                    .map((par: IPar) => {
                                        return (
                                            <option
                                                aria-selected={
                                                    oppgaveFelt.filter &&
                                                    oppgaveFelt.filter.selectedValue === par.id
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
    }

    return (
        <Fieldset legend={'Oppgavebenken filterskjema'} hideLegend>
            <VStack gap="4">
                <HStack gap="6">
                    {Object.values(oppgaveFelter)
                        .filter((oppgaveFelt: IOppgaveFelt) => oppgaveFelt.filter)
                        .map(tilOppgaveFeltKomponent)}
                </HStack>

                <HStack gap="2">
                    <Button
                        variant="primary"
                        onClick={() => {
                            if (validerSkjema()) hentOppgaver();
                        }}
                        loading={oppgaver.status === RessursStatus.HENTER}
                        disabled={oppgaver.status === RessursStatus.HENTER}
                        children={'Hent oppgaver'}
                    />
                    <Button
                        onClick={tilbakestillOppgaveFelter}
                        variant="secondary"
                        children={'Tilbakestill filtrering'}
                    />
                </HStack>
            </VStack>
        </Fieldset>
    );
};

export default FilterSkjema;
