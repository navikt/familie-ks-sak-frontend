import { useState } from 'react';

import { isAfter } from 'date-fns';
import styled from 'styled-components';

import { Alert, BodyShort, Heading, Switch, Table } from '@navikt/ds-react';
import { AFontWeightBold, AGreen700, ASpacing18, ATextDefault, ASurfaceSubtle } from '@navikt/ds-tokens/dist/tokens';
import { AFontWeightRegular, ATextDanger } from '@navikt/ds-tokens/dist/tokens';

import { NavigeringsRetning } from '../../../../../komponenter/Tidslinje/TidslinjeContext';
import TidslinjeNavigering from '../../../../../komponenter/Tidslinje/TidslinjeNavigering';
import type { ISimuleringDTO, ISimuleringPeriode } from '../../../../../typer/simulering';
import {
    Datoformat,
    isoStringTilDate,
    isoDatoPeriodeTilFormatertString,
    isoStringTilFormatertString,
} from '../../../../../utils/dato';
import { formaterBeløp } from '../../../../../utils/formatter';
import { hentPeriodelisteMedTommePerioder, hentÅrISimuleringen } from '../../../../../utils/simulering';

const Årsvelger = styled.div`
    display: flex;
    flex-direction: column;
`;

const StyledSwitch = styled(Switch)`
    width: fit-content;
`;

const StyledAlert = styled(Alert)`
    margin-bottom: 1rem;
`;

const IkkeFullBreddeTabell = styled(Table)`
    width: unset;
`;

const ManuellPosteringRad = styled(Table.Row)`
    background-color: ${ASurfaceSubtle};
`;

const HeaderCelle = styled(Table.HeaderCell)<{ $skalViseStipletLinje: boolean }>`
    border-left: ${props => props.$skalViseStipletLinje && '1px dashed'};
`;

const DataCelle = styled(Table.DataCell)<{ $skalViseStipletLinje: boolean }>`
    width: ${ASpacing18};
    border-left: ${props => props.$skalViseStipletLinje && '1px dashed'};
`;

const DataCellMedFarge = styled(DataCelle)<{
    $erNegativtBeløp: boolean;
    $erNesteUtbetalingsperiode: boolean;
    $skalViseStipletLinje: boolean; // Sendes videre til DataCelle
}>`
    color: ${props => {
        if (props.$erNegativtBeløp) return ATextDanger;
        else if (props.$erNesteUtbetalingsperiode) {
            return AGreen700;
        }
        return ATextDefault;
    }};
    font-weight: ${props => (props.$erNesteUtbetalingsperiode ? AFontWeightBold : AFontWeightRegular)};
`;

const FørsteKolonne = styled(Table.HeaderCell)`
    width: 10rem;
`;

interface ISimuleringProps {
    simulering: ISimuleringDTO;
}

const SimuleringTabell: React.FC<ISimuleringProps> = ({ simulering }) => {
    const {
        fomDatoNestePeriode,
        fom,
        perioder: perioderUtenTommeSimuleringer,
        tomDatoNestePeriode,
        tomSisteUtbetaling,
    } = simulering;
    const perioder = hentPeriodelisteMedTommePerioder(perioderUtenTommeSimuleringer);
    const årISimuleringen = hentÅrISimuleringen(perioder);
    const [indexFramvistÅr, settIndexFramistÅr] = useState(årISimuleringen.length - 1);
    const aktueltÅr = årISimuleringen[indexFramvistÅr];
    const erMerEnn12MånederISimulering = perioder.length > 12;

    const finnesManuellePosteringer = perioder.some(
        periode => periode.manuellPostering && periode.manuellPostering !== 0
    );

    const erManuellPosteringSamtidigSomResultatIkkeErNull = perioder.some(
        periode =>
            periode.manuellPostering && periode.manuellPostering !== 0 && periode.resultat && periode.resultat !== 0
    );
    const [visManuellePosteringer, setVisManuellePosteringer] = useState(
        erManuellPosteringSamtidigSomResultatIkkeErNull
    );

    const kapitaliserTekst = (tekst: string): string => {
        return tekst.charAt(0).toUpperCase() + tekst.slice(1).toLowerCase();
    };

    const periodeErEtterNesteUtbetalingsPeriode = (periode: ISimuleringPeriode) =>
        fomDatoNestePeriode && isAfter(isoStringTilDate(periode.fom), isoStringTilDate(fomDatoNestePeriode));

    const periodeSkalVisesITabell = (periode: ISimuleringPeriode) =>
        !periodeErEtterNesteUtbetalingsPeriode(periode) &&
        (!erMerEnn12MånederISimulering || isoStringTilDate(periode.fom).getFullYear() === aktueltÅr);

    const formaterBeløpUtenValutakode = (beløp?: number) => (beløp ? formaterBeløp(beløp).slice(0, -3) : '-');

    const erISisteÅrAvPerioden = indexFramvistÅr === hentÅrISimuleringen(perioder).length - 1;

    const erNestePeriode = (periode: ISimuleringPeriode): boolean => periode.fom === fomDatoNestePeriode;

    const tilOgFraDatoForSimulering = `${isoDatoPeriodeTilFormatertString({
        fom,
        tom: tomDatoNestePeriode ?? tomSisteUtbetaling,
    })}`;

    return (
        <>
            {erManuellPosteringSamtidigSomResultatIkkeErNull && (
                <StyledAlert variant={'warning'}>
                    Det finnes manuelle posteringer på den forrige behandlingen. Du må mest sannsynlig sende en oppgave
                    til NØS og be dem gjøre manuelle posteringer tilsvarende de manuelle posteringene i tabellen.
                </StyledAlert>
            )}
            <Heading size={'small'} level={'2'} spacing>
                Simuleringsresultat for{' '}
                {perioder.length === 1
                    ? `${isoStringTilFormatertString({
                          isoString: perioder[0].fom,
                          tilFormat: Datoformat.MÅNED_ÅR_NAVN,
                      })}`
                    : `perioden ${tilOgFraDatoForSimulering}`}
            </Heading>
            {finnesManuellePosteringer && (
                <StyledSwitch
                    checked={visManuellePosteringer}
                    onChange={() => setVisManuellePosteringer(!visManuellePosteringer)}
                    size="small"
                >
                    Vis manuelle posteringer
                </StyledSwitch>
            )}
            <IkkeFullBreddeTabell
                aria-label={`Simuleringsresultat for ${
                    erMerEnn12MånederISimulering ? aktueltÅr : `perioden ${tilOgFraDatoForSimulering}`
                }`}
            >
                <Table.Header>
                    <Table.Row>
                        <Table.DataCell>
                            {erMerEnn12MånederISimulering && (
                                <Årsvelger>
                                    <TidslinjeNavigering
                                        naviger={retning =>
                                            retning === NavigeringsRetning.VENSTRE
                                                ? settIndexFramistÅr(indexFramvistÅr - 1)
                                                : settIndexFramistÅr(indexFramvistÅr + 1)
                                        }
                                        kanNavigereTilHøyre={!erISisteÅrAvPerioden}
                                        kanNavigereTilVenstre={!(indexFramvistÅr === 0)}
                                        navigerTilHyøyreTittel={`Vis simuleringsresultat for ${aktueltÅr + 1}`}
                                        navigerTilVenstreTittel={`Vis simuleringsresultat for ${aktueltÅr - 1}`}
                                    >
                                        <BodyShort size={'small'}>{årISimuleringen[indexFramvistÅr]}</BodyShort>
                                    </TidslinjeNavigering>
                                </Årsvelger>
                            )}
                        </Table.DataCell>
                        {perioder.map(
                            periode =>
                                periodeSkalVisesITabell(periode) && (
                                    <HeaderCelle
                                        key={'måned - ' + periode.fom}
                                        align={'center'}
                                        $skalViseStipletLinje={erNestePeriode(periode)}
                                    >
                                        {kapitaliserTekst(
                                            isoStringTilFormatertString({
                                                isoString: periode.fom,
                                                tilFormat: Datoformat.MÅNED_NAVN,
                                            })
                                        )}
                                    </HeaderCelle>
                                )
                        )}
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    <Table.Row>
                        <FørsteKolonne>Nytt beløp</FørsteKolonne>
                        {perioder.map(
                            periode =>
                                periodeSkalVisesITabell(periode) && (
                                    <DataCelle
                                        key={'nytt beløp - ' + periode.fom}
                                        align={'center'}
                                        $skalViseStipletLinje={erNestePeriode(periode)}
                                    >
                                        {formaterBeløpUtenValutakode(periode.nyttBeløp)}
                                    </DataCelle>
                                )
                        )}
                    </Table.Row>
                    <Table.Row>
                        <FørsteKolonne>Tidligere utbetalt</FørsteKolonne>
                        {perioder.map(
                            periode =>
                                periodeSkalVisesITabell(periode) && (
                                    <DataCelle
                                        key={'tidligere utbetalt - ' + periode.fom}
                                        align={'center'}
                                        $skalViseStipletLinje={erNestePeriode(periode)}
                                    >
                                        {formaterBeløpUtenValutakode(periode.tidligereUtbetalt)}
                                    </DataCelle>
                                )
                        )}
                    </Table.Row>
                    <Table.Row>
                        <FørsteKolonne>Resultat</FørsteKolonne>
                        {perioder.map(
                            periode =>
                                periodeSkalVisesITabell(periode) && (
                                    <DataCellMedFarge
                                        key={'resultat - ' + periode.fom}
                                        align={'center'}
                                        $erNegativtBeløp={!!periode.resultat && periode.resultat < 0}
                                        $erNesteUtbetalingsperiode={erNestePeriode(periode)}
                                        $skalViseStipletLinje={erNestePeriode(periode)}
                                    >
                                        {formaterBeløpUtenValutakode(periode.resultat)}
                                    </DataCellMedFarge>
                                )
                        )}
                    </Table.Row>
                    {visManuellePosteringer && (
                        <ManuellPosteringRad>
                            <FørsteKolonne>Manuell postering</FørsteKolonne>
                            {perioder.map(periode => (
                                <DataCelle
                                    key={'manuell postering - ' + periode.fom}
                                    align={'right'}
                                    $skalViseStipletLinje={erNestePeriode(periode)}
                                >
                                    {formaterBeløpUtenValutakode(periode.manuellPostering)}
                                </DataCelle>
                            ))}
                        </ManuellPosteringRad>
                    )}
                </Table.Body>
            </IkkeFullBreddeTabell>
        </>
    );
};
export default SimuleringTabell;
