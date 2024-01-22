import * as React from 'react';

import styled from 'styled-components';

import { XMarkIcon } from '@navikt/aksel-icons';
import { Alert, BodyShort, Box, Button, Heading, HGrid, Label, VStack } from '@navikt/ds-react';
import { ASpacing10, ASpacing4, ASpacing6 } from '@navikt/ds-tokens/dist/tokens';
import type { Etikett } from '@navikt/familie-tidslinje';

import { hentBarnehageplassBeskrivelse } from './OppsummeringsboksUtils';
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
import { dateTilFormatertString, Datoformat } from '../../../utils/dato';
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

interface UtbetalingsbeløpRadProps {
    children?: React.ReactElement[];
}
const UtbetalingsbeløpRad: React.FC<UtbetalingsbeløpRadProps> = ({ children }) => (
    <HGrid columns="1fr 10rem 9rem 5rem" gap={'4'}>
        {children}
    </HGrid>
);

const TotaltUtbetaltRad = styled(HGrid)`
    border-top: 1px dashed;
    padding-top: ${ASpacing4};
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
        const navn = dateTilFormatertString({
            date: aktivEtikett.date,
            tilFormat: Datoformat.MÅNED_ÅR_NAVN,
        });
        return navn[0].toUpperCase() + navn.substring(1);
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
        <Box borderColor="border-strong" borderWidth="1" padding="10">
            <HGrid columns="1fr 3rem" align="center">
                <Heading level="3" size="xsmall">
                    <Label>{månedNavnOgÅr()}</Label>

                    {utbetalingsperiode === undefined && <BodyShort>Ingen utbetalinger</BodyShort>}
                </Heading>
                <Button
                    variant="tertiary"
                    icon={<XMarkIcon />}
                    onClick={() => {
                        settAktivEtikett(undefined);
                    }}
                />
            </HGrid>
            {utbetalingsperiode !== undefined && (
                <>
                    <UtbetalingsbeløpStack gap="4">
                        <UtbetalingsbeløpRad>
                            <BodyShort>Person</BodyShort>
                            <BodyShort>Barnehageplass</BodyShort>
                            <BodyShort>Kontantstøtte</BodyShort>
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
                                    <BodyShort>{detalj.prosent + '%'}</BodyShort>
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
                    </UtbetalingsbeløpStack>
                </>
            )}
        </Box>
    );
};
export { Oppsummeringsboks };
