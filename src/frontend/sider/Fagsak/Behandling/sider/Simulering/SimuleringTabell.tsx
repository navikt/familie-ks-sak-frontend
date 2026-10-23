import { NavigeringsRetning } from '@komponenter/Tidslinje/TidslinjeContext';
import { BodyShort, Box, Heading, LocalAlert, Switch, Table } from '@navikt/ds-react';
import type { ISimuleringDTO, ISimuleringPeriode } from '@typer/simulering';
import {
    Datoformat,
    isoDatoPeriodeTilFormatertString,
    isoStringTilDate,
    isoStringTilFormatertString,
} from '@utils/dato';
import { formaterBeløp } from '@utils/formatter';
import { hentPeriodelisteMedTommePerioder, hentÅrISimuleringen } from '@utils/simulering';
import classNames from 'classnames';
import { isAfter } from 'date-fns';
import { useState } from 'react';
import TidslinjeNavigering from '../../../../../komponenter/Tidslinje/TidslinjeNavigering';
import Styles from './SimuleringTabell.module.css';

interface ISimuleringProps {
    simulering: ISimuleringDTO;
}

const SimuleringTabell = ({ simulering }: ISimuleringProps) => {
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
                <Box marginBlock={'space-0 space-16'}>
                    <LocalAlert status="warning">
                        <LocalAlert.Header>
                            <LocalAlert.Title>Det finnes manuelle posteringer</LocalAlert.Title>
                        </LocalAlert.Header>
                        <LocalAlert.Content>
                            Det finnes manuelle posteringer på den forrige behandlingen. Du må mest sannsynlig sende en
                            oppgave til NØS og be dem gjøre manuelle posteringer tilsvarende de manuelle posteringene i
                            tabellen.
                        </LocalAlert.Content>
                    </LocalAlert>
                </Box>
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
                <Switch
                    className={Styles.switch}
                    checked={visManuellePosteringer}
                    onChange={() => setVisManuellePosteringer(!visManuellePosteringer)}
                    size="small"
                >
                    Vis manuelle posteringer
                </Switch>
            )}
            <Table
                className={Styles.table}
                aria-label={`Simuleringsresultat for ${
                    erMerEnn12MånederISimulering ? aktueltÅr : `perioden ${tilOgFraDatoForSimulering}`
                }`}
            >
                <Table.Header>
                    <Table.Row>
                        <Table.DataCell>
                            {erMerEnn12MånederISimulering && (
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
                            )}
                        </Table.DataCell>
                        {perioder.map(
                            periode =>
                                periodeSkalVisesITabell(periode) && (
                                    <Table.HeaderCell
                                        key={'måned - ' + periode.fom}
                                        align={'center'}
                                        className={classNames({
                                            [Styles.dataCell]: erNestePeriode(periode),
                                        })}
                                    >
                                        {kapitaliserTekst(
                                            isoStringTilFormatertString({
                                                isoString: periode.fom,
                                                tilFormat: Datoformat.MÅNED_NAVN,
                                            })
                                        )}
                                    </Table.HeaderCell>
                                )
                        )}
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    <Table.Row>
                        <Table.HeaderCell className={Styles.firstColumn}>Nytt beløp</Table.HeaderCell>
                        {perioder.map(
                            periode =>
                                periodeSkalVisesITabell(periode) && (
                                    <Table.DataCell
                                        key={'nytt beløp - ' + periode.fom}
                                        align={'center'}
                                        className={classNames(Styles.dataCell, {
                                            [Styles.dashedBorder]: erNestePeriode(periode),
                                        })}
                                    >
                                        {formaterBeløpUtenValutakode(periode.nyttBeløp)}
                                    </Table.DataCell>
                                )
                        )}
                    </Table.Row>
                    <Table.Row>
                        <Table.HeaderCell className={Styles.firstColumn}>Tidligere utbetalt</Table.HeaderCell>
                        {perioder.map(
                            periode =>
                                periodeSkalVisesITabell(periode) && (
                                    <Table.DataCell
                                        key={'tidligere utbetalt - ' + periode.fom}
                                        align={'center'}
                                        className={classNames(Styles.dataCell, {
                                            [Styles.dashedBorder]: erNestePeriode(periode),
                                        })}
                                    >
                                        {formaterBeløpUtenValutakode(periode.tidligereUtbetalt)}
                                    </Table.DataCell>
                                )
                        )}
                    </Table.Row>
                    <Table.Row>
                        <Table.HeaderCell className={Styles.firstColumn}>Resultat</Table.HeaderCell>
                        {perioder.map(
                            periode =>
                                periodeSkalVisesITabell(periode) && (
                                    <Table.DataCell
                                        className={classNames(Styles.dataCell, {
                                            [Styles.dashedBorder]: erNestePeriode(periode),
                                            [Styles.negativeAmount]: !!periode.resultat && periode.resultat < 0,
                                            [Styles.nextPeriodAmount]: erNestePeriode(periode),
                                        })}
                                        key={'resultat - ' + periode.fom}
                                        align={'center'}
                                    >
                                        {formaterBeløpUtenValutakode(periode.resultat)}
                                    </Table.DataCell>
                                )
                        )}
                    </Table.Row>
                    {visManuellePosteringer && (
                        <Table.Row className={Styles.manuellPosteringRad}>
                            <Table.HeaderCell className={Styles.firstColumn}>Manuell postering</Table.HeaderCell>
                            {perioder.map(periode => (
                                <Table.DataCell
                                    className={classNames(Styles.dataCell, {
                                        [Styles.dashedBorder]: erNestePeriode(periode),
                                    })}
                                    key={'manuell postering - ' + periode.fom}
                                    align={'right'}
                                >
                                    {formaterBeløpUtenValutakode(periode.manuellPostering)}
                                </Table.DataCell>
                            ))}
                        </Table.Row>
                    )}
                </Table.Body>
            </Table>
        </>
    );
};
export default SimuleringTabell;
