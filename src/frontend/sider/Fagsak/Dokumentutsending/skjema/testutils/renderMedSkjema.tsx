import type { PropsWithChildren, ReactNode } from 'react';
import { useEffect } from 'react';

import { lagFagsak } from '@testutils/testdata/fagsakTestdata';
import { lagPerson } from '@testutils/testdata/personTestdata';
import { lagSaksbehandler } from '@testutils/testdata/saksbehandlerTestdata';
import { render, TestProviders } from '@testutils/testrender';
import type { IMinimalFagsak } from '@typer/fagsak';
import type { IPersonInfo } from '@typer/person';
import type { Saksbehandler } from '@typer/saksbehandler';
import { Målform } from '@typer/søknad';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';

import { Button } from '@navikt/ds-react';

import { BrukerProvider } from '../../../BrukerContext';
import { FagsakProvider } from '../../../FagsakContext';
import { DokumentutsendingFeltnavn } from '../useDokumentutsendingSkjema';
import type { DokumentutsendingFormValues } from '../useDokumentutsendingSkjema';

const standardDefaultValues: DokumentutsendingFormValues = {
    [DokumentutsendingFeltnavn.ÅRSAK]: '',
    [DokumentutsendingFeltnavn.MÅLFORM]: Målform.NB,
    [DokumentutsendingFeltnavn.FRITEKST_AVSNITT]: '',
    [DokumentutsendingFeltnavn.VALGTE_BARN]: [],
};

interface RenderMedSkjemaOptions {
    defaultValues?: Partial<DokumentutsendingFormValues>;
    bruker?: IPersonInfo;
    fagsak?: IMinimalFagsak;
    saksbehandler?: Saksbehandler;
}

interface FormRef {
    current: UseFormReturn<DokumentutsendingFormValues> | undefined;
}

interface WrapperProps extends PropsWithChildren {
    formRef: FormRef;
    defaultValues: DokumentutsendingFormValues;
    bruker: IPersonInfo;
    fagsak: IMinimalFagsak;
    saksbehandler?: Saksbehandler;
}

function Wrapper({ formRef, defaultValues, bruker, fagsak, saksbehandler, children }: WrapperProps) {
    const form = useForm<DokumentutsendingFormValues>({ defaultValues });

    useEffect(() => {
        formRef.current = form;
    });

    return (
        <TestProviders saksbehandler={saksbehandler}>
            <FagsakProvider fagsak={fagsak}>
                <BrukerProvider bruker={bruker}>
                    <FormProvider {...form}>
                        <form onSubmit={form.handleSubmit(() => {})}>
                            {children}
                            <Button type={'submit'}>Send inn</Button>
                        </form>
                    </FormProvider>
                </BrukerProvider>
            </FagsakProvider>
        </TestProviders>
    );
}

export function renderMedSkjema(ui: ReactNode, options: RenderMedSkjemaOptions = {}) {
    const formRef: FormRef = { current: undefined };
    const defaultValues: DokumentutsendingFormValues = { ...standardDefaultValues, ...options.defaultValues };
    const bruker = options.bruker ?? lagPerson();
    const fagsak = options.fagsak ?? lagFagsak();
    const saksbehandler = options.saksbehandler ?? lagSaksbehandler();

    const rendered = render(ui, {
        wrapper: props => (
            <Wrapper
                {...props}
                formRef={formRef}
                defaultValues={defaultValues}
                bruker={bruker}
                fagsak={fagsak}
                saksbehandler={saksbehandler}
            />
        ),
    });

    return {
        ...rendered,
        sendInnSkjema: () => rendered.user.click(rendered.screen.getByRole('button', { name: 'Send inn' })),
        hentForm: () => formRef.current as UseFormReturn<DokumentutsendingFormValues>,
    };
}
