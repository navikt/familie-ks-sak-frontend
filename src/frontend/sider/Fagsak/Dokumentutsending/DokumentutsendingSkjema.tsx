import { useBruker } from '@hooks/useBruker';
import { useErLesevisningFagsak } from '@hooks/useErLesevisningFagsak';
import { useFagsak } from '@hooks/useFagsak';
import { BrevmottakereAlert } from '@komponenter/BrevmottakereAlert';
import { LeggTilBarnModal } from '@komponenter/Modal/LeggTilBarn/LeggTilBarnModal';
import { LeggTilBarnModalContextProvider } from '@komponenter/Modal/LeggTilBarn/LeggTilBarnModalContext';
import { erFagsakLåst } from '@utils/fagsak';
import { FormProvider } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { FileTextIcon, InformationSquareIcon } from '@navikt/aksel-icons';
import { Alert, Box, Button, Fieldset, Heading, HStack, InfoCard, VStack } from '@navikt/ds-react';

import { finnBarnIBrevÅrsak } from './barnIBrevÅrsak';
import { DokumentÅrsak } from './dokumentÅrsakTyper';
import { LeggTilBarnKnapp } from './LeggTilBarnKnapp';
import { useManuelleBrevmottakerePåFagsakContext } from '../ManuelleBrevmottakerePåFagsakContext';
import { BarnCheckboxGruppe } from './skjema/BarnCheckboxGruppe';
import { FritekstAvsnitt } from './skjema/FritekstAvsnitt';
import { MålformVelger } from './skjema/MålformVelger';
import { ValgteBarnFieldArrayProvider } from './skjema/ValgteBarnFieldArrayContext';
import { ÅrsakVelger } from './skjema/ÅrsakVelger';
import { DokumentutsendingFeltnavn, useDokumentutsendingSkjema } from './useDokumentutsendingSkjema';

interface Props {
    åpneBrevSendtDialog: () => void;
    settForhåndsvisningUrl: (url: string) => void;
}

export function DokumentutsendingSkjema({ åpneBrevSendtDialog, settForhåndsvisningUrl }: Props) {
    const bruker = useBruker();
    const fagsak = useFagsak();
    const navigate = useNavigate();

    const { manuelleBrevmottakerePåFagsak } = useManuelleBrevmottakerePåFagsakContext();

    const { form, onSubmit, hentForhåndsvisning, forhåndsvisningLaster, visForhåndsvisningBeskjed } =
        useDokumentutsendingSkjema({ åpneBrevSendtDialog, settForhåndsvisningUrl });

    const {
        control,
        watch,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = form;

    const årsak = watch(DokumentutsendingFeltnavn.ÅRSAK);
    const barnIBrevÅrsak = finnBarnIBrevÅrsak(årsak || undefined);
    const erLesevisning = useErLesevisningFagsak();
    const skjemaErLåst = erLesevisning || isSubmitting || forhåndsvisningLaster;

    return (
        <ValgteBarnFieldArrayProvider control={control}>
            {({ valgteBarn, leggTilBarn }) => (
                <LeggTilBarnModalContextProvider
                    barn={valgteBarn}
                    onLeggTilBarn={barn => leggTilBarn(barn, { shouldFocus: false })}
                    harBrevmottaker={manuelleBrevmottakerePåFagsak.length > 0}
                >
                    <LeggTilBarnModal />
                    <Box padding={'space-32'} overflow={'auto'}>
                        <FormProvider {...form}>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <Heading size={'large'} level={'1'}>
                                    Send informasjonsbrev
                                </Heading>
                                {erFagsakLåst(fagsak) && (
                                    <Box marginBlock={'space-16'}>
                                        <Alert variant={'info'}>
                                            Fagsaken er låst etter arkivlovens kasseringsregler, og det er ikke mulig å
                                            sende brev. Lås opp fagsaken fra menyen i saksoversikten hvis du likevel
                                            skal sende brev.
                                        </Alert>
                                    </Box>
                                )}
                                {manuelleBrevmottakerePåFagsak.length > 0 && (
                                    <Box marginBlock={'space-16'}>
                                        <BrevmottakereAlert
                                            erPåBehandling={false}
                                            brevmottakere={manuelleBrevmottakerePåFagsak}
                                            bruker={bruker}
                                        />
                                    </Box>
                                )}
                                <Box asChild maxWidth={'30rem'} marginBlock={'space-32 space-0'}>
                                    <Fieldset
                                        error={errors.root?.message}
                                        errorPropagation={false}
                                        legend="Send informasjonsbrev"
                                        hideLegend
                                    >
                                        <VStack gap="space-16">
                                            <ÅrsakVelger />

                                            {barnIBrevÅrsak !== undefined && (
                                                <Box>
                                                    <BarnCheckboxGruppe barnIBrevÅrsak={barnIBrevÅrsak} />
                                                    <LeggTilBarnKnapp />
                                                </Box>
                                            )}

                                            {årsak === DokumentÅrsak.INNHENTE_OPPLYSNINGER_KLAGE && <FritekstAvsnitt />}

                                            <MålformVelger />

                                            {visForhåndsvisningBeskjed && (
                                                <InfoCard data-color="info">
                                                    <InfoCard.Message icon={<InformationSquareIcon aria-hidden />}>
                                                        Du har gjort endringer i brevet som ikke er forhåndsvist
                                                    </InfoCard.Message>
                                                </InfoCard>
                                            )}
                                        </VStack>
                                    </Fieldset>
                                </Box>
                                <HStack justify={'space-between'} marginBlock={'space-24 space-0'}>
                                    <HStack gap={'space-16'}>
                                        <Button
                                            size="medium"
                                            variant="primary"
                                            type={'submit'}
                                            loading={isSubmitting}
                                            disabled={skjemaErLåst}
                                        >
                                            Send brev
                                        </Button>

                                        <Button
                                            size="medium"
                                            variant="tertiary"
                                            type={'button'}
                                            disabled={isSubmitting || forhåndsvisningLaster}
                                            onClick={() => navigate(`/fagsak/${fagsak.id}/saksoversikt`)}
                                        >
                                            Avbryt
                                        </Button>
                                    </HStack>
                                    <Button
                                        variant={'tertiary'}
                                        type={'button'}
                                        id={'forhandsvis-vedtaksbrev'}
                                        size={'medium'}
                                        loading={forhåndsvisningLaster}
                                        disabled={skjemaErLåst}
                                        onClick={hentForhåndsvisning}
                                        icon={<FileTextIcon />}
                                    >
                                        Forhåndsvis
                                    </Button>
                                </HStack>
                            </form>
                        </FormProvider>
                    </Box>
                </LeggTilBarnModalContextProvider>
            )}
        </ValgteBarnFieldArrayProvider>
    );
}
