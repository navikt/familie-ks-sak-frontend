import type { PropsWithChildren } from 'react';

import { useErLesevisning } from '@hooks/useErLesevisning';
import { tidligsteRelevanteDato } from '@komponenter/Datovelger/utils';
import { render } from '@testutils/testrender';
import { format } from 'date-fns';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { describe, expect, test, vi } from 'vitest';

import { EndringstidspunktField } from './EndringstidspunktField';
import { Feltnavn, type FormValues } from './useEndringstidspunktForm';

vi.mock('@hooks/useErLesevisning');

function Wrapper({ children }: PropsWithChildren) {
    const form = useForm<FormValues>({
        defaultValues: {
            [Feltnavn.ENDRINGSTIDSPUNKT]: null,
        },
    });

    const { control, handleSubmit } = form;

    const endringstidspunkt = useWatch({ control, name: Feltnavn.ENDRINGSTIDSPUNKT });

    return (
        <FormProvider {...form}>
            <form onSubmit={handleSubmit(() => {})}>
                {children}
                <button type={'submit'}>Send inn</button>
                <output aria-label={'Verdi'}>{JSON.stringify(endringstidspunkt)}</output>
            </form>
        </FormProvider>
    );
}

describe('EndringstidspunktField', () => {
    beforeEach(() => {
        vi.mocked(useErLesevisning).mockReturnValue(false);
    });

    test('viser feltet med riktig label og placeholder', () => {
        const { screen } = render(<EndringstidspunktField />, { wrapper: Wrapper });

        expect(screen.getByRole('textbox', { name: 'Nytt endringstidspunkt' })).toHaveAttribute(
            'placeholder',
            'DD.MM.ÅÅÅÅ'
        );
    });

    test('viser feilmelding når feltet er tomt og skjemaet valideres', async () => {
        const { screen, user } = render(<EndringstidspunktField />, { wrapper: Wrapper });

        await user.click(screen.getByRole('button', { name: 'Send inn' }));

        expect(await screen.findByText('Du må velge en gyldig dato.')).toBeInTheDocument();
    });

    test('viser verdien man skriver inn når datoen er gyldig', async () => {
        const { screen, user } = render(<EndringstidspunktField />, { wrapper: Wrapper });

        const datofelt = screen.getByRole('textbox', { name: 'Nytt endringstidspunkt' });
        await user.type(datofelt, '15.06.2023');

        expect(datofelt).toHaveValue('15.06.2023');
        expect(screen.queryByText(/du må velge en gyldig dato/i)).not.toBeInTheDocument();
    });

    test('lagrer datoen som en ISO-dato i skjemaet', async () => {
        const { screen, user } = render(<EndringstidspunktField />, { wrapper: Wrapper });

        await user.type(screen.getByRole('textbox', { name: 'Nytt endringstidspunkt' }), '15.06.2023');

        expect(screen.getByLabelText('Verdi')).toHaveTextContent('"2023-06-15"');
    });

    test('viser feilmelding når datoen er tidligere enn tidligste gyldige dato', async () => {
        const { screen, user } = render(<EndringstidspunktField />, { wrapper: Wrapper });

        await user.click(screen.getByRole('button', { name: 'Send inn' }));
        await screen.findByText('Du må velge en gyldig dato.');

        const datofelt = screen.getByRole('textbox', { name: 'Nytt endringstidspunkt' });
        await user.type(datofelt, '01.01.1899');

        expect(
            await screen.findByText(
                `Du må velge en dato som er senere enn 1. ${format(tidligsteRelevanteDato, 'MMMM yyyy')}.`
            )
        ).toBeInTheDocument();
    });

    test('viser feilmelding når datoen er frem i tid', async () => {
        const { screen, user } = render(<EndringstidspunktField />, { wrapper: Wrapper });

        await user.click(screen.getByRole('button', { name: 'Send inn' }));
        await screen.findByText('Du må velge en gyldig dato.');

        const datofelt = screen.getByRole('textbox', { name: 'Nytt endringstidspunkt' });
        await user.type(datofelt, '01.01.2999');

        expect(await screen.findByText('Du kan ikke sette en dato som er frem i tid.')).toBeInTheDocument();
    });

    test('viser feilmelding når datoen ikke er gyldig', async () => {
        const { screen, user } = render(<EndringstidspunktField />, { wrapper: Wrapper });

        await user.click(screen.getByRole('button', { name: 'Send inn' }));
        await screen.findByText('Du må velge en gyldig dato.');

        const datofelt = screen.getByRole('textbox', { name: 'Nytt endringstidspunkt' });
        await user.type(datofelt, '31.13.2023');

        expect(await screen.findByText('Du må velge en gyldig dato.')).toBeInTheDocument();
    });

    test('gjør feltet skrivebeskyttet når man er i lesevisning', () => {
        vi.mocked(useErLesevisning).mockReturnValue(true);

        const { screen } = render(<EndringstidspunktField />, { wrapper: Wrapper });

        expect(screen.getByRole('textbox', { name: 'Nytt endringstidspunkt' })).toHaveAttribute('readonly');
    });

    test('gjør ikke feltet skrivebeskyttet når man ikke er i lesevisning', () => {
        const { screen } = render(<EndringstidspunktField />, { wrapper: Wrapper });

        expect(screen.getByRole('textbox', { name: 'Nytt endringstidspunkt' })).not.toHaveAttribute('readonly');
    });
});
