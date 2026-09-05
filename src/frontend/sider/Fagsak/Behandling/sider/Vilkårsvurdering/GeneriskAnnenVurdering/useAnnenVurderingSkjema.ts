import { useMemo } from 'react';

import { useConfirmBrowserRefresh } from '@hooks/useConfirmBrowserRefresh';
import { useOnFormSubmitSuccessful } from '@hooks/useOnFormSubmitSuccessful';
import { useOppdaterAnnenVurdering } from '@hooks/useOppdaterAnnenVurdering';
import { useBehandlingContext } from '@sider/Fagsak/Behandling/context/BehandlingContext';
import type { IAnnenVurdering, Resultat } from '@typer/vilkår';
import { useForm } from 'react-hook-form';

import { byggSuksessRessurs } from '@navikt/familie-typer';

export enum AnnenVurderingFelt {
    RESULTAT = 'resultat',
    BEGRUNNELSE = 'begrunnelse',
}

export interface AnnenVurderingFormValues {
    [AnnenVurderingFelt.RESULTAT]: Resultat;
    [AnnenVurderingFelt.BEGRUNNELSE]: string;
}

interface Props {
    annenVurdering: IAnnenVurdering;
    lukkSkjema: () => void;
}

export function useAnnenVurderingSkjema({ annenVurdering, lukkSkjema }: Props) {
    const { behandling, settÅpenBehandling } = useBehandlingContext();
    const { mutateAsync: oppdaterAnnenVurdering } = useOppdaterAnnenVurdering();

    const values = useMemo<AnnenVurderingFormValues>(
        () => ({
            [AnnenVurderingFelt.RESULTAT]: annenVurdering.resultat,
            [AnnenVurderingFelt.BEGRUNNELSE]: annenVurdering.begrunnelse ?? '',
        }),
        [annenVurdering]
    );

    const form = useForm<AnnenVurderingFormValues>({ values });

    const {
        control,
        setError,
        reset,
        formState: { isDirty },
    } = form;

    useConfirmBrowserRefresh({ enabled: isDirty });

    useOnFormSubmitSuccessful(control, () => reset());

    const onSubmit = async (values: AnnenVurderingFormValues) => {
        return oppdaterAnnenVurdering({
            behandlingId: behandling.behandlingId,
            annenVurdering: {
                id: annenVurdering.id,
                behandlingId: annenVurdering.behandlingId,
                endretAv: annenVurdering.endretAv,
                endretTidspunkt: annenVurdering.endretTidspunkt,
                erVurdert: annenVurdering.erVurdert,
                type: annenVurdering.type,
                resultat: values.resultat,
                begrunnelse: values.begrunnelse,
            },
        })
            .then(oppdatertBehandling => {
                settÅpenBehandling(byggSuksessRessurs(oppdatertBehandling));
                lukkSkjema();
            })
            .catch((error: unknown) => {
                setError('root', {
                    message:
                        error instanceof Error
                            ? error.message
                            : 'En ukjent feil har oppstått, vi har ikke klart å lagre endringen.',
                });
            });
    };

    return { form, onSubmit };
}
