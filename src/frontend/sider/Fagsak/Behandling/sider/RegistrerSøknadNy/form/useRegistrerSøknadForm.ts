import { useId } from 'react';

import { ApiFeil, RessursStatus } from '@api/client/apiClient';
import { useBruker } from '@hooks/useBruker';
import { useConfirmBrowserRefresh } from '@hooks/useConfirmBrowserRefresh';
import { useFagsak } from '@hooks/useFagsak';
import { useOnFormSubmitSuccessful } from '@hooks/useOnFormSubmitSuccessful';
import { useRegistrerSøknad } from '@hooks/useRegistrerSøknad';
import { useBehandlingContext } from '@sider/Fagsak/Behandling/context/BehandlingContext';
import { useBekreftEndringModalContext } from '@sider/Fagsak/Behandling/sider/RegistrerSøknadNy/form/BekreftEndringModalContext';
import { useValgbareBarn } from '@sider/Fagsak/Behandling/sider/RegistrerSøknadNy/form/useValgbareBarn';
import type { IBarnMedOpplysninger, Målform } from '@typer/søknad';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { byggSuksessRessurs } from '@navikt/familie-typer';

export enum RegistrerSøknadFormField {
    BARN = 'barn',
    BEGRUNNELSE = 'begrunnelse',
    MÅLFORM = 'målform',
}

export interface RegistrerSøknadFormValues {
    [RegistrerSøknadFormField.BARN]: IBarnMedOpplysninger[];
    [RegistrerSøknadFormField.BEGRUNNELSE]: string;
    [RegistrerSøknadFormField.MÅLFORM]: Målform | '';
}

export interface TransformedRegistrerSøknadFormValues {
    [RegistrerSøknadFormField.BARN]: IBarnMedOpplysninger[];
    [RegistrerSøknadFormField.BEGRUNNELSE]: string;
    [RegistrerSøknadFormField.MÅLFORM]: Målform;
}

export function useRegistrerSøknadForm() {
    const id = useId();
    const fagsak = useFagsak();
    const bruker = useBruker();
    const navigate = useNavigate();

    const { behandling, settÅpenBehandling } = useBehandlingContext();
    const { åpneBekreftEndringModal, lukkBekreftEndringModal } = useBekreftEndringModalContext();

    const { mutateAsync: registrerSøknad } = useRegistrerSøknad();

    const søknadsgrunnlag = behandling.søknadsgrunnlag;

    const valgbareBarn = useValgbareBarn();

    const form = useForm<RegistrerSøknadFormValues, unknown, TransformedRegistrerSøknadFormValues>({
        values: {
            [RegistrerSøknadFormField.BARN]: valgbareBarn,
            [RegistrerSøknadFormField.BEGRUNNELSE]: søknadsgrunnlag?.endringAvOpplysningerBegrunnelse || '',
            [RegistrerSøknadFormField.MÅLFORM]: søknadsgrunnlag?.søkerMedOpplysninger.målform || '',
        },
        resetOptions: {
            keepErrors: true,
            keepDirtyValues: true,
            keepIsSubmitted: true,
            keepTouched: true,
            keepSubmitCount: true,
        },
    });

    const {
        control,
        formState: { isDirty },
        setError,
        reset,
    } = form;

    useConfirmBrowserRefresh({ enabled: isDirty });

    useOnFormSubmitSuccessful(control, () => reset());

    async function onSubmit(
        values: TransformedRegistrerSøknadFormValues,
        modus: 'ubekreftet' | 'bekreftet' = 'ubekreftet'
    ): Promise<void> {
        const { barn, målform, begrunnelse } = values;
        try {
            const oppdatertBehandling = await registrerSøknad({
                behandlingId: behandling.behandlingId,
                søknad: {
                    søkerMedOpplysninger: {
                        ident: bruker.personIdent,
                        målform: målform,
                    },
                    barnaMedOpplysninger: barn.map(barn => ({
                        ...barn,
                        inkludertISøknaden: barn.merket,
                    })),
                    endringAvOpplysningerBegrunnelse: begrunnelse,
                },
                bekreftEndringerViaFrontend: modus === 'bekreftet',
            });
            settÅpenBehandling(byggSuksessRessurs(oppdatertBehandling));
            navigate(`/fagsak/${fagsak.id}/${oppdatertBehandling.behandlingId}/vilkaarsvurdering`);
            if (modus === 'bekreftet') {
                lukkBekreftEndringModal();
            }
        } catch (error: unknown) {
            if (error instanceof ApiFeil && error.ressursStatus === RessursStatus.FUNKSJONELL_FEIL) {
                const message = error instanceof Error ? error.message : 'En ukjent feil oppstod.';
                åpneBekreftEndringModal(message);
            } else {
                const message = error instanceof Error ? error.message : 'En ukjent feil oppstod.';
                setError('root', { message });
            }
        }
    }

    return {
        id,
        ...form,
        onSubmit,
    };
}
