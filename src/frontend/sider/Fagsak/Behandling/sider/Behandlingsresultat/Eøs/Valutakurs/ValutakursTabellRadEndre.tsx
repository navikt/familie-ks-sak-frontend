import { useErLesevisning } from '@hooks/useErLesevisning';
import type { OptionType } from '@typer/common';
import { EøsPeriodeStatus, type IRestValutakurs } from '@typer/eøsPerioder';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';

import { TrashIcon } from '@navikt/aksel-icons';
import { Box, Button, Fieldset, HGrid, Link, LocalAlert } from '@navikt/ds-react';

import { type ValutakursFormValues } from './useValutakursSkjema';
import { ValutakursBarnFelt } from './ValutakursBarnFelt';
import { ValutakursDatoFelt } from './ValutakursDatoFelt';
import { ValutakursKursFelt } from './ValutakursKursFelt';
import { ValutakursPeriodeFelt } from './ValutakursPeriodeFelt';
import { ValutakursValutaFelt } from './ValutakursValutaFelt';
import { EøsPeriodeSkjemaContainer, Knapperad } from '../EøsKomponenter/EøsSkjemaKomponenter';

const StyledPeriodeWrapper = styled.div`
    margin-top: 1.5rem;
`;

const StyledFieldset = styled(Fieldset)`
    margin-top: 1.5rem;
`;

interface Props {
    valutakurs: IRestValutakurs;
    tilgjengeligeBarn: OptionType[];
    initielFom: string;
    erManuellInputAvKurs: boolean;
    behandlingsÅrsakErOvergangsordning: boolean;
    onAvbryt: () => void;
    slettValutakurs: () => void;
    sletterValutakurs: boolean;
}

const ValutakursTabellRadEndre = ({
    valutakurs,
    tilgjengeligeBarn,
    initielFom,
    erManuellInputAvKurs,
    behandlingsÅrsakErOvergangsordning,
    onAvbryt,
    slettValutakurs,
    sletterValutakurs,
}: Props) => {
    const erLesevisning = useErLesevisning();

    const {
        formState: { isSubmitting, errors },
    } = useFormContext<ValutakursFormValues>();

    const erRedigeringDeaktivert = erLesevisning;

    const periodeFeilmeldingId = `valutakurs-periode_${valutakurs.barnIdenter.map(barn => `${barn}`)}_${valutakurs.fom}`;

    return (
        <Fieldset error={errors.root?.message} legend={'Endre valutakurs'} hideLegend>
            <EøsPeriodeSkjemaContainer $lesevisning={erRedigeringDeaktivert} $status={valutakurs.status}>
                <ValutakursBarnFelt tilgjengeligeBarn={tilgjengeligeBarn} lesevisning={erRedigeringDeaktivert} />
                <StyledPeriodeWrapper>
                    <ValutakursPeriodeFelt
                        initielFom={initielFom}
                        periodeFeilmeldingId={periodeFeilmeldingId}
                        lesevisning={erRedigeringDeaktivert}
                        behandlingsÅrsakErOvergangsordning={behandlingsÅrsakErOvergangsordning}
                    />
                </StyledPeriodeWrapper>
                <StyledFieldset legend={'Registrer valutakursdato'}>
                    <HGrid columns={'1fr 2fr 1fr'} gap={'space-12'}>
                        <ValutakursDatoFelt readOnly={erRedigeringDeaktivert} />
                        <ValutakursValutaFelt />
                        <ValutakursKursFelt
                            readOnly={erRedigeringDeaktivert || !erManuellInputAvKurs}
                            erManuellInputAvKurs={erManuellInputAvKurs}
                        />
                    </HGrid>
                    {erManuellInputAvKurs && (
                        <Box marginBlock={'space-32 space-0'}>
                            <LocalAlert status="warning">
                                <LocalAlert.Header>
                                    <LocalAlert.Title>
                                        Manuell innhenting av valutakurs for Islandske kroner (ISK)
                                    </LocalAlert.Title>
                                </LocalAlert.Header>
                                Systemet har ikke valutakurser for valutakursdatoer før 1. februar 2018. Disse må hentes
                                fra{' '}
                                <Link
                                    href="https://navno.sharepoint.com/:x:/r/sites/fag-og-ytelser-familie-barnetrygd/Delte%20dokumenter/E%C3%98S/Valutakalkulator%202022.xlsm?d=w200955f53e1d4323ae72f9d1b15f617c&csf=1&web=1&e=w3OE5N"
                                    target="_blank"
                                >
                                    Valutakalkulator
                                </Link>
                                .
                            </LocalAlert>
                        </Box>
                    )}
                </StyledFieldset>
                {!erRedigeringDeaktivert && (
                    <Knapperad>
                        <div>
                            <Button type={'submit'} size="small" variant={'primary'} loading={isSubmitting}>
                                Ferdig
                            </Button>
                            <Button
                                type={'button'}
                                style={{ marginLeft: '1rem' }}
                                onClick={onAvbryt}
                                size="small"
                                variant="tertiary"
                            >
                                Avbryt
                            </Button>
                        </div>

                        {valutakurs.status !== EøsPeriodeStatus.IKKE_UTFYLT && (
                            <Button
                                type={'button'}
                                variant={'tertiary'}
                                onClick={slettValutakurs}
                                id={`slett_valutakurs_${valutakurs.barnIdenter.map(barn => `${barn}-`)}_${initielFom}`}
                                loading={sletterValutakurs}
                                size={'small'}
                                icon={<TrashIcon />}
                            >
                                Fjern
                            </Button>
                        )}
                    </Knapperad>
                )}
            </EøsPeriodeSkjemaContainer>
        </Fieldset>
    );
};

export default ValutakursTabellRadEndre;
