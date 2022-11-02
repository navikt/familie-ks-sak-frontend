import * as React from 'react';

import styled from 'styled-components';

import { Xknapp } from 'nav-frontend-ikonknapper';

import { Alert, BodyShort, Label } from '@navikt/ds-react';
import type { Etikett } from '@navikt/familie-tidslinje';

import { useTidslinje } from '../../../context/TidslinjeContext';
import type {
    IEøsPeriodeStatus,
    IRestEøsPeriode,
    IRestKompetanse,
    IRestUtenlandskPeriodeBeløp,
    IRestValutakurs,
} from '../../../typer/eøsPerioder';
import { EøsPeriodeStatus, KompetanseResultat } from '../../../typer/eøsPerioder';
import type { Utbetalingsperiode } from '../../../typer/vedtaksperiode';
import {
    datoformat,
    formaterBeløp,
    formaterIdent,
    formaterIsoDato,
    hentAlderSomString,
    sorterUtbetaling,
} from '../../../utils/formatter';
import { kalenderDatoFraDate, serializeIso8601String } from '../../../utils/kalender';
import { hentBarnehageplassBeskrivelse } from './OppsummeringsboksUtils';

const TableHeaderAlignedRight = styled.th`
    text-align: right;
`;

const TableDataAlignedRight = styled.td`
    text-align: right;
`;

const AlertAlignedRight = styled(Alert)`
    float: right;
`;

const FlexDiv = styled.div`
    display: flex;
`;

const UtbetalingsbeløpTable = styled.table`
    width: 100%;
    padding-bottom: 1rem;
`;

const VenstreTekst = styled(BodyShort)`
    text-align: left;
    font-weight: bold;
    width: 50%;
    margin: 1.25rem 0;
`;

const HøyreTekst = styled(BodyShort)`
    text-align: right;
    font-weight: bold;
    width: 50%;
    margin: 1.25rem 2.5rem 1.25rem 0;
`;

interface IProps {
    utbetalingsperiode: Utbetalingsperiode | undefined;
    aktivEtikett: Etikett;
    kompetanser: IRestKompetanse[];
    utbetaltAnnetLandBeløp: IRestUtenlandskPeriodeBeløp[];
    valutakurser: IRestValutakurs[];
}

const finnUtbetalingsBeløpStatusMap = (
    utbetalingsperiode: Utbetalingsperiode | undefined,
    kompetanser: IRestKompetanse[],
    utbetaltAnnetLandBeløp: IRestUtenlandskPeriodeBeløp[],
    valutakurser: IRestValutakurs[]
): Map<string, boolean> => {
    const utbetalingsMap = new Map<string, boolean>();
    utbetalingsperiode?.utbetalingsperiodeDetaljer.forEach(upd => {
        const barnIdent = upd.person.personIdent;
        const kompetanserForBarn = finnKompetanserForBarn(kompetanser, barnIdent);
        const norgeErSekundærland = kompetanserForBarn.some(
            kompetanseForBarn =>
                kompetanseForBarn.resultat === KompetanseResultat.NORGE_ER_SEKUNDÆRLAND
        );
        let skalViseUtbetalingsBeløp = !norgeErSekundærland;

        if (norgeErSekundærland) {
            const kompetanseStatusOk = erAllePerioderUtfyltForBarn(kompetanserForBarn);
            const utbetaltAnnetLandStatusOk = erAllePerioderUtfyltForBarn(
                finnEøsPerioderForBarn(utbetaltAnnetLandBeløp, barnIdent)
            );
            const valutakursStatusOk = erAllePerioderUtfyltForBarn(
                finnEøsPerioderForBarn(valutakurser, barnIdent)
            );
            skalViseUtbetalingsBeløp =
                kompetanseStatusOk && utbetaltAnnetLandStatusOk && valutakursStatusOk;
        }
        utbetalingsMap.set(barnIdent, skalViseUtbetalingsBeløp);
    });
    return utbetalingsMap;
};

const finnEøsPerioderForBarn = (
    restEøsPerioder: IRestEøsPeriode[],
    barnIdent: string
): IRestEøsPeriode[] => {
    return (
        restEøsPerioder.filter(restEøsPeriode => restEøsPeriode.barnIdenter.includes(barnIdent)) ??
        []
    );
};

const finnKompetanserForBarn = (
    kompetanseFelter: IRestKompetanse[],
    barnIdent: string
): IRestKompetanse[] => {
    return (
        kompetanseFelter.filter(kompetanseFelt => kompetanseFelt.barnIdenter.includes(barnIdent)) ??
        []
    );
};

const erAllePerioderUtfyltForBarn = (eøsPeriodeStatus: IEøsPeriodeStatus[]) => {
    return eøsPeriodeStatus.every(eøsPeriode => eøsPeriode.status === EøsPeriodeStatus.OK);
};

const Oppsummeringsboks: React.FunctionComponent<IProps> = ({
    utbetalingsperiode,
    aktivEtikett,
    kompetanser,
    utbetaltAnnetLandBeløp,
    valutakurser,
}) => {
    const { settAktivEtikett } = useTidslinje();

    const [utbetalingsBeløpStatusMap, setUtbetalingsBeløpStatusMap] = React.useState(
        new Map<string, boolean>()
    );

    const månedNavnOgÅr = () => {
        const navn = formaterIsoDato(
            serializeIso8601String(kalenderDatoFraDate(aktivEtikett.date)),
            datoformat.MÅNED_ÅR_NAVN
        );
        return navn[0].toUpperCase() + navn.substr(1);
    };

    React.useEffect(() => {
        setUtbetalingsBeløpStatusMap(
            finnUtbetalingsBeløpStatusMap(
                utbetalingsperiode,
                kompetanser,
                utbetaltAnnetLandBeløp,
                valutakurser
            )
        );
    }, [utbetalingsperiode, kompetanser, utbetaltAnnetLandBeløp, valutakurser]);

    return (
        <div className={'behandlingsresultat-informasjonsboks'}>
            <div className={'behandlingsresultat-informasjonsboks__header'}>
                <div className={'behandlingsresultat-informasjonsboks__header__info'}>
                    <Label>{månedNavnOgÅr()}</Label>

                    {utbetalingsperiode === undefined && <BodyShort>Ingen utbetalinger</BodyShort>}
                </div>
                <Xknapp
                    onClick={() => {
                        settAktivEtikett(undefined);
                    }}
                />
            </div>
            {utbetalingsperiode !== undefined && (
                <>
                    <UtbetalingsbeløpTable>
                        <thead>
                            <tr>
                                <th>Person</th>
                                <th>Barnehageplass</th>
                                <th>Kontantstøtte</th>
                                <TableHeaderAlignedRight>Beløp</TableHeaderAlignedRight>
                            </tr>
                        </thead>
                        <tbody>
                            {utbetalingsperiode.utbetalingsperiodeDetaljer
                                .sort(sorterUtbetaling)
                                .map((detalj, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>
                                                <BodyShort>{`${
                                                    detalj.person.navn
                                                } (${hentAlderSomString(
                                                    detalj.person.fødselsdato
                                                )}) | ${formaterIdent(
                                                    detalj.person.personIdent
                                                )}`}</BodyShort>
                                            </td>
                                            <td>
                                                <BodyShort>
                                                    {hentBarnehageplassBeskrivelse(
                                                        detalj.antallTimer
                                                    )}
                                                </BodyShort>
                                            </td>
                                            <td>
                                                <BodyShort>{detalj.prosent + '%'}</BodyShort>
                                            </td>
                                            <TableDataAlignedRight>
                                                {utbetalingsBeløpStatusMap.get(
                                                    detalj.person.personIdent
                                                ) ? (
                                                    <BodyShort>
                                                        {formaterBeløp(detalj.utbetaltPerMnd)}
                                                    </BodyShort>
                                                ) : (
                                                    <AlertAlignedRight
                                                        variant="warning"
                                                        children={'Må beregnes'}
                                                        size={'small'}
                                                        inline
                                                    />
                                                )}
                                            </TableDataAlignedRight>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </UtbetalingsbeløpTable>

                    <div className="dashed-hr" style={{ marginRight: '2.5rem' }}>
                        <div className="line" />
                    </div>
                    <FlexDiv>
                        <VenstreTekst>Totalt utbetalt per mnd</VenstreTekst>
                        <HøyreTekst>{formaterBeløp(utbetalingsperiode.utbetaltPerMnd)}</HøyreTekst>
                    </FlexDiv>
                </>
            )}
        </div>
    );
};
export { Oppsummeringsboks };
