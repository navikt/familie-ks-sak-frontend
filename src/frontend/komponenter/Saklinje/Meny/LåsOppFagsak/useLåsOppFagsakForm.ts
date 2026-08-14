import { ModalType } from '@context/ModalContext';
import { useFagsak } from '@hooks/useFagsak';
import { HentFagsakQueryKeyFactory } from '@hooks/useHentFagsak';
import { useLåsOppFagsak } from '@hooks/useLåsOppFagsak';
import { useModal } from '@hooks/useModal';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

export enum LåsOppFagsakFormFields {
    BEGRUNNELSE = 'begrunnelse',
}

export interface LåsOppFagsakFormValues {
    [LåsOppFagsakFormFields.BEGRUNNELSE]: string;
}

export const LÅS_OPP_FAGSAK_FORM_ID = 'las_opp_fagsak_modal_form';

export function useLåsOppFagsakForm() {
    const fagsak = useFagsak();
    const { lukkModal } = useModal(ModalType.LÅS_OPP_FAGSAK);
    const { mutateAsync } = useLåsOppFagsak(fagsak.id);
    const queryClient = useQueryClient();

    const form = useForm<LåsOppFagsakFormValues>({
        defaultValues: {
            [LåsOppFagsakFormFields.BEGRUNNELSE]: '',
        },
    });

    const { setError } = form;

    async function onSubmit(values: LåsOppFagsakFormValues) {
        const { begrunnelse } = values;
        try {
            await mutateAsync({ begrunnelse: begrunnelse.trim() });
        } catch (error) {
            // Kun feil fra selve opplåsingen skal rapporteres som en mislykket opplåsing.
            setError('root', { message: (error as Error).message });
            return;
        }
        await queryClient.invalidateQueries({
            queryKey: HentFagsakQueryKeyFactory.fagsak(fagsak.id),
        });
        lukkModal();
    }

    return { form, onSubmit };
}
