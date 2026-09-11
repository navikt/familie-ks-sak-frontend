import { useState } from 'react';

import { useErLesevisning } from '@hooks/useErLesevisning';
import { useOpprettManueltBrevPdf } from '@hooks/useOpprettManueltBrevPdf';
import { useBehandlingContext } from '@sider/Fagsak/Behandling/context/BehandlingContext';
import type { IPersonInfo } from '@typer/person';
import { FormProvider } from 'react-hook-form';

import { FileTextIcon, XMarkOctagonFillIcon } from '@navikt/aksel-icons';
import { Button, Dialog, ErrorMessage, Fieldset, Heading, HStack, Label, Loader, VStack } from '@navikt/ds-react';

import { AntallUkerSvarfristField } from './AntallUkerSvarfristField';
import { BarnBrevetGjelderField } from './BarnBrevetGjelderField';
import {
    skalViseAntallUkerSvarfrist,
    skalViseBarnBrevetGjelder,
    skalViseDokumenter,
    skalViseFritekstAvsnitt,
    skalViseFritekstKulepunkter,
    skalViseMottakerlandSed,
} from './brevmalRegler';
import { BrevmalSelect } from './BrevmalSelect';
import BrevmottakerListe from './BrevmottakerListe';
import styles from './Brevskjema.module.css';
import { DokumenterField } from './DokumenterField';
import { FritekstAvsnittField } from './FritekstAvsnittField';
import { FritekstKulepunkterField } from './FritekstKulepunkterField';
import { MottakerlandSedField } from './MottakerlandSedField';
import { MottakerSelect } from './MottakerSelect';
import { BrevmodulFeltnavn, useBrevModul } from './useBrevModul';

interface IProps {
    onSubmitSuccess: () => void;
    bruker: IPersonInfo;
}

export const Brevskjema = ({ onSubmitSuccess, bruker }: IProps) => {
    const { behandling } = useBehandlingContext();
    const erLesevisning = useErLesevisning();

    const {
        form,
        onSubmit,
        hentSkjemaData,
        mottakersMålform,
        hentMuligeBrevMaler,
        onEndreBrevmal,
        leggTilFritekstKulepunkt,
        personer,
        brevmottakere,
        visFritekstAvsnittTekstboks,
        settVisFritekstAvsnittTekstboks,
    } = useBrevModul({ onSubmitSuccess });

    const {
        handleSubmit,
        watch,
        formState: { isSubmitting, errors },
    } = form;

    const [visForhåndsvisningDialog, settVisForhåndsvisningDialog] = useState(false);

    const {
        data: manueltBrevPdf,
        mutate: opprettManueltBrevPdf,
        isPending: opprettManueltBrevPdfIsPending,
        error: opprettManueltBrevPdfError,
    } = useOpprettManueltBrevPdf();

    const brevmal = watch(BrevmodulFeltnavn.BREVMAL);
    const brevMaler = hentMuligeBrevMaler();
    const skjemaErLåst = erLesevisning || isSubmitting || opprettManueltBrevPdfIsPending;

    if (erLesevisning) {
        return null;
    }

    return (
        <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Fieldset error={errors.root?.message} legend={'Send brev'} hideLegend>
                    <Label>Brev sendes til</Label>
                    <BrevmottakerListe bruker={bruker} brevmottakere={brevmottakere} />
                    <VStack gap={'space-16'}>
                        <MottakerSelect personer={personer} />
                        <BrevmalSelect brevMaler={brevMaler} onEndreBrevmal={onEndreBrevmal} />
                        {skalViseMottakerlandSed(brevmal, behandling.kategori) && <MottakerlandSedField />}
                        {skalViseDokumenter(brevmal) && <DokumenterField mottakersMålform={mottakersMålform} />}
                        {skalViseFritekstKulepunkter(brevmal) && (
                            <FritekstKulepunkterField leggTilFritekstKulepunkt={leggTilFritekstKulepunkt} />
                        )}
                        {skalViseFritekstAvsnitt(brevmal) && (
                            <FritekstAvsnittField
                                visFritekstAvsnittTekstboks={visFritekstAvsnittTekstboks}
                                settVisFritekstAvsnittTekstboks={settVisFritekstAvsnittTekstboks}
                            />
                        )}
                        {skalViseBarnBrevetGjelder(brevmal) && (
                            <BarnBrevetGjelderField behandlingSteg={behandling.steg} />
                        )}
                        {skalViseAntallUkerSvarfrist(brevmal) && <AntallUkerSvarfristField />}
                    </VStack>
                </Fieldset>
                <HStack marginBlock={'space-16'} justify={'space-between'}>
                    <>
                        <Button
                            id={'forhandsvis-vedtaksbrev'}
                            type={'button'}
                            variant={'secondary'}
                            size={'small'}
                            disabled={skjemaErLåst}
                            onClick={handleSubmit(values => {
                                opprettManueltBrevPdf({
                                    behandlingId: behandling.behandlingId,
                                    payload: hentSkjemaData(values),
                                });
                                settVisForhåndsvisningDialog(true);
                            })}
                            icon={<FileTextIcon />}
                        >
                            Forhåndsvis
                        </Button>
                        <Dialog open={visForhåndsvisningDialog} onOpenChange={settVisForhåndsvisningDialog}>
                            <Dialog.Popup width={'max(100rem, 60vw)'} height={'80vh'}>
                                <Dialog.Header>
                                    <Dialog.Title>Forhåndsvisning av brev</Dialog.Title>
                                </Dialog.Header>
                                <Dialog.Body className={styles.body}>
                                    {opprettManueltBrevPdfIsPending && (
                                        <HStack height={'100%'} justify={'center'} align={'center'} gap={'space-8'}>
                                            <Loader size={'small'} title={'Laster dokument...'} />
                                            <Heading size={'small'} level={'2'}>
                                                Laster dokument...
                                            </Heading>
                                        </HStack>
                                    )}
                                    {opprettManueltBrevPdfError && (
                                        <HStack height={'100%'} justify={'center'} align={'center'} gap={'space-8'}>
                                            <XMarkOctagonFillIcon
                                                color={'var(--ax-text-danger-subtle)'}
                                                fontSize={'1.2rem'}
                                            />
                                            <ErrorMessage>{opprettManueltBrevPdfError.message}</ErrorMessage>
                                        </HStack>
                                    )}
                                    {!opprettManueltBrevPdfIsPending && !opprettManueltBrevPdfError && (
                                        <iframe className={styles.iframe} title={'Dokument'} src={manueltBrevPdf} />
                                    )}
                                </Dialog.Body>
                            </Dialog.Popup>
                        </Dialog>
                    </>
                    <Button
                        type={'submit'}
                        variant={'primary'}
                        size={'small'}
                        loading={isSubmitting}
                        disabled={skjemaErLåst}
                    >
                        Send brev
                    </Button>
                </HStack>
            </form>
        </FormProvider>
    );
};
