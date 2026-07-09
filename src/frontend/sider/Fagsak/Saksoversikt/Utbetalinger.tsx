import type { IUtbetalingsperiodeDetalj, Vedtaksperiode } from '@typer/vedtaksperiode';
import { Vedtaksperiodetype } from '@typer/vedtaksperiode';
import { formaterBeløp, sorterUtbetaling } from '@utils/formatter';

import { BodyShort, Box, HStack, VStack } from '@navikt/ds-react';

import { SaksoversiktPanelBredde } from './FagsakLenkepanel';
import PersonUtbetaling from './PersonUtbetaling';

interface IUtbetalingerProps {
    vedtaksperiode?: Vedtaksperiode;
}

const Utbetalinger = ({ vedtaksperiode }: IUtbetalingerProps) => {
    if (vedtaksperiode?.vedtaksperiodetype !== Vedtaksperiodetype.UTBETALING) return null;

    const utbetalingsperiodeDetaljerGruppertPåPerson =
        vedtaksperiode?.utbetalingsperiodeDetaljer
            .sort(sorterUtbetaling)
            .reduce((acc: { [key: string]: IUtbetalingsperiodeDetalj[] }, utbetalingsperiodeDetalj) => {
                const utbetalingsperiodeDetaljerForPerson = acc[utbetalingsperiodeDetalj.person.personIdent] ?? [];

                return {
                    ...acc,
                    [utbetalingsperiodeDetalj.person.personIdent]: [
                        ...utbetalingsperiodeDetaljerForPerson,
                        utbetalingsperiodeDetalj,
                    ],
                };
            }, {}) ?? {};

    return (
        <VStack maxWidth={SaksoversiktPanelBredde} marginBlock={'space-32 space-0'} gap="space-16">
            {Object.values(utbetalingsperiodeDetaljerGruppertPåPerson).map(
                (utbetalingsperiodeDetaljerForPerson, index) => {
                    return (
                        <PersonUtbetaling
                            key={index}
                            utbetalingsperiodeDetaljer={utbetalingsperiodeDetaljerForPerson}
                        />
                    );
                }
            )}
            <Box asChild borderWidth={'0 0 1 0'} borderColor={'neutral-strong'}>
                <HStack marginInline={'space-32 space-0'} paddingBlock={'space-0 space-8'} justify="space-between">
                    <BodyShort>Totalt utbetalt/mnd</BodyShort>
                    <BodyShort weight="semibold">
                        {vedtaksperiode ? formaterBeløp(vedtaksperiode.utbetaltPerMnd) : '-'}
                    </BodyShort>
                </HStack>
            </Box>
        </VStack>
    );
};

export default Utbetalinger;
