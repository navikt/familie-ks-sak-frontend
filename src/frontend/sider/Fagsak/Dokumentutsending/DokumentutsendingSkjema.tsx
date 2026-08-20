import { useBruker } from '@hooks/useBruker';
import { useFagsak } from '@hooks/useFagsak';
import { useSaksbehandler } from '@hooks/useSaksbehandler';
import { BrevmottakereAlert } from '@komponenter/BrevmottakereAlert';
import { LeggTilBarnModal } from '@komponenter/Modal/LeggTilBarn/LeggTilBarnModal';
import { LeggTilBarnModalContextProvider } from '@komponenter/Modal/LeggTilBarn/LeggTilBarnModalContext';
import type { IBarnMedOpplysninger } from '@typer/søknad';
import { erFagsakLåst } from '@utils/fagsak';
import { useFormContext } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { FileTextIcon, InformationSquareIcon } from '@navikt/aksel-icons';
import { Alert, Box, Button, Fieldset, Heading, HStack, InfoCard, VStack } from '@navikt/ds-react';

import { barnIBrevÅrsakTilTittel, finnBarnIBrevÅrsak } from './barnIBrevÅrsak';
import { useDokumentutsendingContext } from './DokumentutsendingContext';
import { DokumentÅrsak } from './dokumentÅrsakTyper';
import { LeggTilBarnKnapp } from './LeggTilBarnKnapp';
import { useManuelleBrevmottakerePåFagsakContext } from '../ManuelleBrevmottakerePåFagsakContext';
import { BarnIBrevSkjema } from './skjema/BarnIBrevSkjema';
import { FritekstAvsnitt } from './skjema/FritekstAvsnitt';
import { MålformVelger } from './skjema/MålformVelger';
import type { DokumentutsendingFormValues } from './skjema/useDokumentutsendingSkjema';
import { DokumentutsendingFeltnavn } from './skjema/useDokumentutsendingSkjema';
import { ÅrsakVelger } from './skjema/ÅrsakVelger';

export function DokumentutsendingSkjema() {
    const bruker = useBruker();
    const saksbehandler = useSaksbehandler();
    const fagsak = useFagsak();
    const navigate = useNavigate();

    const { manuelleBrevmottakerePåFagsak } = useManuelleBrevmottakerePåFagsakContext();

    const { watch, getValues, setValue, handleSubmit } = useFormContext<DokumentutsendingFormValues>();

    const {
        hentForhåndsvisning,
        forhåndsvisningLaster,
        senderBrev,
        sendBrev,
        skjemaErLåst,
        skjemaFeilmelding,
        visForhåndsvisningBeskjed,
    } = useDokumentutsendingContext();

    const årsak = watch(DokumentutsendingFeltnavn.ÅRSAK);
    const valgteBarn = watch(DokumentutsendingFeltnavn.VALGTE_BARN);

    const barnIBrevÅrsak = finnBarnIBrevÅrsak(årsak || undefined);
    const skalViseFritekstAvsnitt = årsak === DokumentÅrsak.INNHENTE_OPPLYSNINGER_KLAGE;

    const erLesevisning = !saksbehandler.harSkrivetilgang || erFagsakLåst(fagsak);

    function onLeggTilBarn(barn: IBarnMedOpplysninger) {
        setValue(DokumentutsendingFeltnavn.VALGTE_BARN, [...getValues(DokumentutsendingFeltnavn.VALGTE_BARN), barn], {
            shouldValidate: true,
        });
    }

    return (
        <LeggTilBarnModalContextProvider
            barn={valgteBarn}
            onLeggTilBarn={onLeggTilBarn}
            harBrevmottaker={manuelleBrevmottakerePåFagsak.length > 0}
        >
            {!erLesevisning && <LeggTilBarnModal />}
            <Box padding={'space-32'} overflow={'auto'}>
                <form onSubmit={handleSubmit(sendBrev)}>
                    <Heading size={'large'} level={'1'} children={'Send informasjonsbrev'} />
                    {erFagsakLåst(fagsak) && (
                        <Box marginBlock={'space-16'}>
                            <Alert variant={'info'}>
                                Fagsaken er låst etter arkivlovens kasseringsregler, og det er ikke mulig å sende brev.
                                Lås opp fagsaken fra menyen i saksoversikten hvis du likevel skal sende brev.
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
                            error={skjemaFeilmelding}
                            errorPropagation={false}
                            legend="Send informasjonsbrev"
                            hideLegend
                        >
                            <VStack gap="space-16">
                                <ÅrsakVelger />

                                {skalViseFritekstAvsnitt && <FritekstAvsnitt />}

                                {barnIBrevÅrsak !== undefined && (
                                    <Box>
                                        <BarnIBrevSkjema tittel={barnIBrevÅrsakTilTittel[barnIBrevÅrsak]} />
                                        {!erLesevisning && <LeggTilBarnKnapp />}
                                    </Box>
                                )}

                                <MålformVelger />

                                {årsak && visForhåndsvisningBeskjed() && (
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
                                loading={senderBrev}
                                disabled={skjemaErLåst || erLesevisning}
                            >
                                Send brev
                            </Button>

                            <Button
                                size="medium"
                                variant="tertiary"
                                type={'button'}
                                onClick={() => navigate(`/fagsak/${fagsak.id}/saksoversikt`)}
                            >
                                Avbryt
                            </Button>
                        </HStack>
                        {årsak && (
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
                                {'Forhåndsvis'}
                            </Button>
                        )}
                    </HStack>
                </form>
            </Box>
        </LeggTilBarnModalContextProvider>
    );
}
