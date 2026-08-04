import { useBehandling } from '@hooks/useBehandling';
import { useErLesevisning } from '@hooks/useErLesevisning';
import { useFagsak } from '@hooks/useFagsak';
import { LeggTilBarnModal } from '@komponenter/Modal/LeggTilBarn/LeggTilBarnModal';
import { LeggTilBarnModalContextProvider } from '@komponenter/Modal/LeggTilBarn/LeggTilBarnModalContext';
import { BarnaFieldArrayProvider } from '@sider/Fagsak/Behandling/sider/RegistrerSøknadNy/form/BarnaFieldArrayContext';
import { BekreftEndringModal } from '@sider/Fagsak/Behandling/sider/RegistrerSøknadNy/form/BekreftEndringModal';
import { useBekreftEndringModalContext } from '@sider/Fagsak/Behandling/sider/RegistrerSøknadNy/form/BekreftEndringModalContext';
import { Feilsammendrag } from '@sider/Fagsak/Behandling/sider/RegistrerSøknadNy/form/Feilsammendrag';
import { BarnaField } from '@sider/Fagsak/Behandling/sider/RegistrerSøknadNy/form/field/BarnaField';
import { BegrunnelseField } from '@sider/Fagsak/Behandling/sider/RegistrerSøknadNy/form/field/BegrunnelseField';
import { MålformField } from '@sider/Fagsak/Behandling/sider/RegistrerSøknadNy/form/field/MålformField';
import { LeggTilBarnKnapp } from '@sider/Fagsak/Behandling/sider/RegistrerSøknadNy/form/LeggTilBarnKnapp';
import {
    RegistrerSøknadFormField,
    useRegistrerSøknadForm,
} from '@sider/Fagsak/Behandling/sider/RegistrerSøknadNy/form/useRegistrerSøknadForm';
import { FormProvider } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { Button, Fieldset, VStack } from '@navikt/ds-react';

export function RegistrerSøknadForm() {
    const navigate = useNavigate();
    const fagsak = useFagsak();
    const behandling = useBehandling();
    const erLesevisning = useErLesevisning();

    const { erBekreftEndringModalÅpen } = useBekreftEndringModalContext();

    const form = useRegistrerSøknadForm();

    const {
        id,
        control,
        handleSubmit,
        formState: { isSubmitting, errors },
        watch,
        onSubmit,
    } = form;

    const barn = watch(RegistrerSøknadFormField.BARN);

    const harBrevmottaker = behandling.brevmottakere.length > 0;

    function submitEllerNaviger(event: React.FormEvent<HTMLFormElement>) {
        if (erLesevisning) {
            event.preventDefault();
            navigate(`/fagsak/${fagsak.id}/${behandling.behandlingId}/vilkaarsvurdering`);
            return;
        }
        return handleSubmit(data => onSubmit(data, 'ubekreftet'))(event);
    }

    return (
        <BarnaFieldArrayProvider control={control}>
            {({ leggTilBarn }) => (
                <LeggTilBarnModalContextProvider
                    barn={barn}
                    onLeggTilBarn={leggTilBarn}
                    harBrevmottaker={harBrevmottaker}
                >
                    {!erLesevisning && <LeggTilBarnModal />}
                    <FormProvider {...form}>
                        <form id={id} onSubmit={submitEllerNaviger}>
                            {erBekreftEndringModalÅpen && <BekreftEndringModal onSubmit={onSubmit} />}
                            <VStack gap={'space-20'}>
                                <Fieldset
                                    error={errors.root?.message}
                                    legend={'Registrer søknad'}
                                    hideLegend={true}
                                    errorPropagation={false}
                                >
                                    <VStack gap={'space-20'} marginBlock={'space-20'}>
                                        <VStack gap={'space-0'}>
                                            <BarnaField />
                                            {!erLesevisning && <LeggTilBarnKnapp />}
                                        </VStack>
                                        <MålformField />
                                        <BegrunnelseField />
                                    </VStack>
                                </Fieldset>
                                <Feilsammendrag />
                                <div>
                                    <Button form={id} type={'submit'} variant={'primary'} loading={isSubmitting}>
                                        {erLesevisning ? 'Neste' : 'Bekreft og fortsett'}
                                    </Button>
                                </div>
                            </VStack>
                        </form>
                    </FormProvider>
                </LeggTilBarnModalContextProvider>
            )}
        </BarnaFieldArrayProvider>
    );
}
