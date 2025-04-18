import React, { useState } from 'react';

import styled from 'styled-components';

import { PlusCircleIcon } from '@navikt/aksel-icons';
import { Button, CopyButton, Heading, Table } from '@navikt/ds-react';
import { ATextAction } from '@navikt/ds-tokens/dist/tokens';

import FeilutbetaltValutaPeriode from './FeilutbetaltValutaPeriode';
import NyFeilutbetaltValutaPeriode from './NyFeilutbetaltValutaPeriode';
import type { IRestFeilutbetaltValuta } from '../../../../../../typer/eøs-feilutbetalt-valuta';
import { isoDatoPeriodeTilFormatertString } from '../../../../../../utils/dato';

interface IFeilutbetaltValuta {
    behandlingId: number;
    fagsakId: string | undefined;
    feilutbetaltValutaListe: IRestFeilutbetaltValuta[];
    settErUlagretNyFeilutbetaltValutaPeriode: (erUlagretNyFeilutbetaltValuta: boolean) => void;
    erLesevisning: boolean;
    skjulFeilutbetaltValuta: () => void;
}

const FlexColumnDiv = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 3.5rem;
    margin-top: 2rem;
`;

const FlexRowDiv = styled.div`
    display: flex;
    justify-content: space-between;
`;

const KopierTilNøsKnapp = styled(CopyButton)`
    :not(:hover):not(:active) {
        color: ${ATextAction};
    }
`;

const FeilutbetaltValuta: React.FC<IFeilutbetaltValuta> = ({
    feilutbetaltValutaListe,
    settErUlagretNyFeilutbetaltValutaPeriode,
    erLesevisning,
    skjulFeilutbetaltValuta,
    behandlingId,
    fagsakId,
}) => {
    const [ønskerÅLeggeTilNyPeriode, settØnskerÅLeggeTilNyPeriode] = useState(
        feilutbetaltValutaListe.length === 0
    );

    const oppdaterØnskerÅLeggeTilNyPeriode = (ønskerÅLeggeTilNyPeriode: boolean) => {
        settØnskerÅLeggeTilNyPeriode(ønskerÅLeggeTilNyPeriode);
        settErUlagretNyFeilutbetaltValutaPeriode(ønskerÅLeggeTilNyPeriode);
    };

    if (feilutbetaltValutaListe.length === 0 && !ønskerÅLeggeTilNyPeriode) {
        skjulFeilutbetaltValuta();
    }

    const totaltFeilutbetaltBeløp = feilutbetaltValutaListe.reduce(
        (acc, val) => acc + val.feilutbetaltBeløp,
        0
    );

    const tekstTilNØS = `Viser til følgende vedtak \nhttps://kontantstotte.intern.nav.no/fagsak/${fagsakId}/${behandlingId}/vedtak
    \nBer om at feilutbetalingsbeløpet på grunn av valuta- og satsendringer trekkes i fremtidige utbetalinger.
    \nTotalt kr ${totaltFeilutbetaltBeløp}
    \n${feilutbetaltValutaListe
        .map(
            feilutbetaltValuta =>
                `${isoDatoPeriodeTilFormatertString({
                    fom: feilutbetaltValuta.fom,
                    tom: feilutbetaltValuta.tom,
                })} kr ${feilutbetaltValuta.feilutbetaltBeløp}`
        )
        .join('\n')}`;

    return (
        <FlexColumnDiv>
            <Heading level="2" size="small" spacing>
                Feilutbetalt valuta og sats
            </Heading>
            <Table size="small">
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell />
                        <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
                        <Table.HeaderCell align="right" scope="col">
                            Feilutbetalt beløp
                        </Table.HeaderCell>
                        <Table.HeaderCell scope="col" />
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {feilutbetaltValutaListe &&
                        feilutbetaltValutaListe.map(feilutbetaltValuta => (
                            <FeilutbetaltValutaPeriode
                                key={feilutbetaltValuta.id}
                                behandlingId={behandlingId}
                                feilutbetaltValuta={feilutbetaltValuta}
                                erLesevisning={erLesevisning}
                            />
                        ))}
                    {ønskerÅLeggeTilNyPeriode && (
                        <NyFeilutbetaltValutaPeriode
                            lukkNyPeriode={() => oppdaterØnskerÅLeggeTilNyPeriode(false)}
                            behandlingId={behandlingId}
                        />
                    )}
                </Table.Body>
            </Table>
            <FlexRowDiv>
                {!ønskerÅLeggeTilNyPeriode && !erLesevisning && (
                    <Button
                        variant="tertiary"
                        size="small"
                        icon={<PlusCircleIcon />}
                        onClick={() => oppdaterØnskerÅLeggeTilNyPeriode(true)}
                    >
                        Legg til ny periode
                    </Button>
                )}
                <KopierTilNøsKnapp
                    copyText={tekstTilNØS}
                    text="Kopier tekst til NØS"
                    activeText="Kopiert!"
                    size="small"
                />
            </FlexRowDiv>
        </FlexColumnDiv>
    );
};

export default FeilutbetaltValuta;
