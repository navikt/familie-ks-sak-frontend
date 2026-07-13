import type { IUtbetalingsperiodeDetalj } from '@typer/vedtaksperiode';
import { formaterBeløp } from '@utils/formatter';

import { BodyShort, Box, HStack } from '@navikt/ds-react';

import { PersonInformasjonUtbetaling } from './PersonInformasjonUtbetaling';
import styles from './PersonUtbetaling.module.css';

interface IPersonUtbetalingProps {
    utbetalingsperiodeDetaljer: IUtbetalingsperiodeDetalj[];
}

const PersonUtbetaling = ({ utbetalingsperiodeDetaljer }: IPersonUtbetalingProps) => {
    return (
        <section>
            <PersonInformasjonUtbetaling person={utbetalingsperiodeDetaljer[0].person} />
            <Box
                marginInline={'space-32 space-0'}
                marginBlock={'space-8 space-16'}
                asChild
                borderColor={'neutral'}
                borderWidth={'0 0 1 0'}
                className={styles.ytelse}
            >
                <section>
                    {utbetalingsperiodeDetaljer.map(utbetalingsperiodeDetalj => {
                        return (
                            <HStack
                                marginBlock={'space-0 space-16'}
                                key={utbetalingsperiodeDetalj.person.personIdent}
                                justify="space-between"
                            >
                                <BodyShort>Kontantstøtte</BodyShort>
                                <BodyShort>{formaterBeløp(utbetalingsperiodeDetalj.utbetaltPerMnd)}</BodyShort>
                            </HStack>
                        );
                    })}
                </section>
            </Box>
        </section>
    );
};

export default PersonUtbetaling;
