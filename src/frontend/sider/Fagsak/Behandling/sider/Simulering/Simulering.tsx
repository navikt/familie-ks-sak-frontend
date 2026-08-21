import { useBehandling } from '@hooks/useBehandling';
import { useErLesevisning } from '@hooks/useErLesevisning';
import { useFagsakId } from '@hooks/useFagsakId';
import { TilbakekrevingForm } from '@sider/Fagsak/Behandling/sider/Simulering/form/TilbakekrevingForm';
import { useTilbakekrevingForm } from '@sider/Fagsak/Behandling/sider/Simulering/form/useTilbakekrevingForm';
import { useSimuleringContext } from '@sider/Fagsak/Behandling/sider/Simulering/SimuleringContext';
import { BehandlingResultat, BehandlingSteg } from '@typer/behandling';
import { FormProvider } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { InformationSquareIcon } from '@navikt/aksel-icons';
import { Box, InfoCard, LocalAlert } from '@navikt/ds-react';

import SimuleringPanel from './SimuleringPanel';
import SimuleringTabell from './SimuleringTabell';
import Skjemasteg from '../../../../../komponenter/Skjemasteg/Skjemasteg';

export function Simulering() {
    const fagsakId = useFagsakId();
    const behandling = useBehandling();
    const erLesevisning = useErLesevisning();
    const navigate = useNavigate();

    const { simulering, erFeilutbetaling } = useSimuleringContext();

    const { form, onSubmit } = useTilbakekrevingForm();

    const {
        handleSubmit,
        formState: { isSubmitting, errors },
    } = form;

    function nesteOnClick() {
        if (erLesevisning || behandling.resultat === BehandlingResultat.AVSLÅTT) {
            navigate(`/fagsak/${fagsakId}/${behandling.behandlingId}/vedtak`);
            return;
        }
        void handleSubmit(onSubmit)();
    }

    function forrigeOnClick() {
        navigate(`/fagsak/${fagsakId}/${behandling.behandlingId}/tilkjent-ytelse`);
    }

    return (
        <Skjemasteg
            senderInn={isSubmitting}
            tittel="Simulering"
            className="simulering"
            forrigeOnClick={forrigeOnClick}
            nesteOnClick={nesteOnClick}
            maxWidthStyle={'80rem'}
            steg={BehandlingSteg.SIMULERING}
        >
            <FormProvider {...form}>
                {simulering.perioder.length === 0 ? (
                    <InfoCard data-color="info">
                        <InfoCard.Message icon={<InformationSquareIcon aria-hidden />}>
                            Det er ingen etterbetaling, feilutbetaling eller neste utbetaling
                        </InfoCard.Message>
                    </InfoCard>
                ) : (
                    <>
                        <SimuleringPanel simulering={simulering} />
                        <SimuleringTabell simulering={simulering} />
                        {erFeilutbetaling && <TilbakekrevingForm />}
                    </>
                )}

                {errors.root?.message && (
                    <Box marginBlock={'space-16 space-32'}>
                        <LocalAlert status="error">
                            <LocalAlert.Header>
                                <LocalAlert.Title>
                                    Det har skjedd en feil og vi klarte ikke å lagre tilbakekrevingsvalget
                                </LocalAlert.Title>
                            </LocalAlert.Header>
                            <LocalAlert.Content>{errors.root.message}</LocalAlert.Content>
                        </LocalAlert>
                    </Box>
                )}
            </FormProvider>
        </Skjemasteg>
    );
}
