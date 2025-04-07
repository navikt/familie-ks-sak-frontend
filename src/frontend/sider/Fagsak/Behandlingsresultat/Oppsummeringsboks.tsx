import type { PropsWithChildren } from 'react';
import * as React from 'react';

import styled from 'styled-components';

import { XMarkIcon } from '@navikt/aksel-icons';
import { Alert, BodyShort, Box, Button, Heading, HGrid, VStack } from '@navikt/ds-react';
import { ASpacing10, ASpacing4, ASpacing6 } from '@navikt/ds-tokens/dist/tokens';
import type { Etikett } from '@navikt/familie-tidslinje';

import { hentBarnehageplassBeskrivelse } from './OppsummeringsboksUtils';
import { useTidslinje } from '../../../context/TidslinjeContext';
import { type IBehandling } from '../../../typer/behandling';
import { ytelsetype, YtelseType } from '../../../typer/beregning';
import type {
    IEøsPeriodeStatus,
    IRestEøsPeriode,
    IRestKompetanse,
    IRestUtenlandskPeriodeBeløp,
    IRestValutakurs,
} from '../../../typer/eøsPerioder';
import { EøsPeriodeStatus, KompetanseResultat } from '../../../typer/eøsPerioder';
import type { Utbetalingsperiode } from '../../../typer/utbetalingsperiode';
import {
    dateTilFormatertString,
    Datoformat,
    periodeOverlapperMedValgtDato,
} from '../../../utils/dato';
import {
    formaterBeløp,
    formaterIdent,
    hentAlderSomString,
    sorterUtbetaling,
} from '../../../utils/formatter';

const AlertAlignedRight = styled(Alert)`
    float: right;
`;

const UtbetalingsbeløpStack = styled(VStack)`
    padding: ${ASpacing6} ${ASpacing10} ${ASpacing4} 0;
`;

const TotaltUtbetaltRad = styled(HGrid)`
    border-top: 1px dashed;
    padding-top: ${ASpacing4};
`;

interface IProps {
    åpenBehandling: IBehandling;
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
    åpenBehandling,
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
        const navn = dateTilFormatertString({
            date: aktivEtikett.date,
            tilFormat: Datoformat.MÅNED_ÅR_NAVN,
        });
        return navn[0].toUpperCase() + navn.substring(1);
    };

    const finnUtbetalingsperiodeForAktivEtikett = (
        utbetalingsperioder: Utbetalingsperiode[]
    ): Utbetalingsperiode | undefined => {
        return aktivEtikett
            ? utbetalingsperioder.find((utbetalingsperiode: Utbetalingsperiode) =>
                  periodeOverlapperMedValgtDato(
                      utbetalingsperiode.periodeFom,
                      utbetalingsperiode.periodeTom,
                      aktivEtikett.date
                  )
              )
            : undefined;
    };

    const utbetalingsperiode = finnUtbetalingsperiodeForAktivEtikett(
        åpenBehandling.utbetalingsperioder
    );

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

    const skalViseYtelseType =
        utbetalingsperiode &&
        utbetalingsperiode.utbetalingsperiodeDetaljer.some(
            upd =>
                upd.ytelseType === YtelseType.OVERGANGSORDNING ||
                upd.ytelseType === YtelseType.PRAKSISENDRING_2024
        );

    const UtbetalingsbeløpRad: React.FC<PropsWithChildren> = ({ children }) => {
        const columns = skalViseYtelseType ? '1fr 10rem 9rem 12rem 5rem' : '1fr 10rem 9rem 5rem';

        return (
            <HGrid columns={columns} gap={'4'}>
                {children}
            </HGrid>
        );
    };

    const erAndelForPraksisendring = utbetalingsperiode?.utbetalingsperiodeDetaljer.some(
        upd => upd.ytelseType === YtelseType.PRAKSISENDRING_2024
    );

    return (
        <Box borderColor="border-strong" borderWidth="1" padding="10">
            <HGrid columns="1fr 3rem" align="center">
                <Heading level="3" size="xsmall">
                    {månedNavnOgÅr()}
                </Heading>
                <Button
                    variant="tertiary"
                    icon={<XMarkIcon />}
                    onClick={() => {
                        settAktivEtikett(undefined);
                    }}
                />
            </HGrid>
            {utbetalingsperiode === undefined ? (
                <BodyShort spacing>Ingen utbetalinger</BodyShort>
            ) : (
                <>
                    <UtbetalingsbeløpStack gap="4">
                        <UtbetalingsbeløpRad>
                            <BodyShort>Person</BodyShort>
                            <BodyShort>Barnehageplass</BodyShort>
                            <BodyShort>Kontantstøtte</BodyShort>
                            {skalViseYtelseType && <BodyShort>Ytelsetype</BodyShort>}
                            <BodyShort>Beløp</BodyShort>
                        </UtbetalingsbeløpRad>
                        {utbetalingsperiode.utbetalingsperiodeDetaljer
                            .sort(sorterUtbetaling)
                            .map(detalj => (
                                <UtbetalingsbeløpRad key={detalj.person.navn}>
                                    <BodyShort>{`${detalj.person.navn} (${hentAlderSomString(
                                        detalj.person.fødselsdato
                                    )}) | ${formaterIdent(detalj.person.personIdent)}`}</BodyShort>
                                    <BodyShort>
                                        {hentBarnehageplassBeskrivelse(
                                            detalj.prosent,
                                            detalj.erPåvirketAvEndring
                                        )}
                                    </BodyShort>
                                    <BodyShort>{detalj.prosent + '% '}</BodyShort>
                                    {skalViseYtelseType && (
                                        <BodyShort>{ytelsetype[detalj.ytelseType].navn}</BodyShort>
                                    )}
                                    {utbetalingsBeløpStatusMap.get(detalj.person.personIdent) ? (
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
                                </UtbetalingsbeløpRad>
                            ))}
                        <TotaltUtbetaltRad columns="1fr 5rem">
                            <BodyShort weight="semibold">Totalt utbetalt per mnd</BodyShort>
                            <BodyShort weight="semibold">
                                {formaterBeløp(utbetalingsperiode.utbetaltPerMnd)}
                            </BodyShort>
                        </TotaltUtbetaltRad>
                        {erAndelForPraksisendring && (
                            <Alert variant={'info'} size={'small'}>
                                <BodyShort>
                                    Utbetaling i tråd med fastsatt praksis ifm lovendring 2024.
                                </BodyShort>
                            </Alert>
                        )}
                    </UtbetalingsbeløpStack>
                </>
            )}
        </Box>
    );
};
export { Oppsummeringsboks };
