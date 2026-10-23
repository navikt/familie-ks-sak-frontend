import { useErLesevisning } from '@hooks/useErLesevisning';
import { TrashIcon } from '@navikt/aksel-icons';
import { Bleed, Box, Button, Fieldset, HGrid, HStack, Link, LocalAlert, VStack } from '@navikt/ds-react';
import type { OptionType } from '@typer/common';
import { EøsPeriodeStatus, type IRestValutakurs } from '@typer/eøsPerioder';
import { useFormContext } from 'react-hook-form';
import type { ValutakursFormValues } from './useValutakursSkjema';
import { ValutakursBarnFelt } from './ValutakursBarnFelt';
import { ValutakursDatoFelt } from './ValutakursDatoFelt';
import { ValutakursKursFelt } from './ValutakursKursFelt';
import { ValutakursPeriodeFelt } from './ValutakursPeriodeFelt';
import { ValutakursValutaFelt } from './ValutakursValutaFelt';

interface Props {
    valutakurs: IRestValutakurs;
    tilgjengeligeBarn: OptionType[];
    initiellFom: string;
    erManuellInputAvKurs: boolean;
    behandlingsÅrsakErOvergangsordning: boolean;
    onAvbryt: () => void;
    slettValutakurs: () => void;
    sletterValutakurs: boolean;
}

const ValutakursTabellRadEndre = ({
    valutakurs,
    tilgjengeligeBarn,
    initiellFom,
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

    const periodeFeilmeldingId = `valutakurs-periode_${valutakurs.barnIdenter.map(barn => `${barn}`)}_${valutakurs.fom}`;

    return (
        <Fieldset error={errors.root?.message} legend={'Endre valutakurs'} hideLegend>
            <Bleed asChild marginInline={'space-48 space-0'}>
                <VStack maxWidth={'40rem'} paddingInline={'space-32 space-0'} gap="space-24">
                    <ValutakursBarnFelt tilgjengeligeBarn={tilgjengeligeBarn} lesevisning={erLesevisning} />
                    <ValutakursPeriodeFelt
                        initiellFom={initiellFom}
                        periodeFeilmeldingId={periodeFeilmeldingId}
                        lesevisning={erLesevisning}
                        behandlingsÅrsakErOvergangsordning={behandlingsÅrsakErOvergangsordning}
                    />
                    <Fieldset legend={'Registrer valutakursdato'}>
                        <HGrid columns={'1fr 2fr 1fr'} gap={'space-12'}>
                            <ValutakursDatoFelt readOnly={erLesevisning} />
                            <ValutakursValutaFelt />
                            <ValutakursKursFelt
                                readOnly={erLesevisning || !erManuellInputAvKurs}
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
                                    Systemet har ikke valutakurser for valutakursdatoer før 1. februar 2018. Disse må
                                    hentes fra{' '}
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
                    </Fieldset>
                    {!erLesevisning && (
                        <HStack justify={'space-between'} marginBlock={'space-32 space-16'}>
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
                                    id={`slett_valutakurs_${valutakurs.barnIdenter.map(barn => `${barn}-`)}_${initiellFom}`}
                                    loading={sletterValutakurs}
                                    size={'small'}
                                    icon={<TrashIcon />}
                                >
                                    Fjern
                                </Button>
                            )}
                        </HStack>
                    )}
                </VStack>
            </Bleed>
        </Fieldset>
    );
};

export default ValutakursTabellRadEndre;
