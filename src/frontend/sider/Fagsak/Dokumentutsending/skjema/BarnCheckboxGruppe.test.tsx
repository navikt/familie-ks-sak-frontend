import { renderMedSkjema } from '@sider/Fagsak/Dokumentutsending/skjema/testutils/renderMedSkjema';
import { lagFagsak } from '@testutils/testdata/fagsakTestdata';
import { FagsakStatus } from '@typer/fagsak';
import type { IBarnMedOpplysninger } from '@typer/søknad';
import { useFormContext } from 'react-hook-form';
import { describe, expect, test } from 'vitest';

import { BarnIBrevÅrsak } from '../barnIBrevÅrsak';
import { DokumentÅrsak } from '../dokumentÅrsakTyper';
import { BarnCheckboxGruppe } from './BarnCheckboxGruppe';
import type { DokumentutsendingFormValues } from '../useDokumentutsendingSkjema';
import { ValgteBarnFieldArrayProvider } from './ValgteBarnFieldArrayContext';

function BarnCheckboxGruppeMedFieldArray() {
    const { control } = useFormContext<DokumentutsendingFormValues>();

    return (
        <ValgteBarnFieldArrayProvider control={control}>
            <BarnCheckboxGruppe barnIBrevÅrsak={BarnIBrevÅrsak.BARN_SØKT_FOR} />
        </ValgteBarnFieldArrayProvider>
    );
}

const barn1: IBarnMedOpplysninger = {
    ident: '01011012345',
    navn: 'Eldst Barnesen',
    fødselsdato: '2010-01-01',
    merket: false,
    manueltRegistrert: false,
    erFolkeregistrert: true,
};

const barn2: IBarnMedOpplysninger = {
    ident: '01011512345',
    navn: 'Yngst Barnesen',
    fødselsdato: '2015-01-01',
    merket: false,
    manueltRegistrert: false,
    erFolkeregistrert: true,
};

const manueltRegistrertBarn: IBarnMedOpplysninger = {
    ident: '01012012345',
    navn: 'Manuelt Barnesen',
    fødselsdato: '2020-01-01',
    merket: false,
    manueltRegistrert: true,
    erFolkeregistrert: false,
};

const manueltRegistrertBarnUtenIdent: IBarnMedOpplysninger = {
    ...manueltRegistrertBarn,
    ident: '',
};

describe('BarnCheckboxGruppe', () => {
    test('viser feilmelding når skjemaet sendes inn uten at noen barn er merket', async () => {
        const { sendInnSkjema, screen } = renderMedSkjema(<BarnCheckboxGruppeMedFieldArray />, {
            defaultValues: {
                årsak: DokumentÅrsak.TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HAR_FÅTT_EN_SØKNAD_FRA_ANNEN_FORELDER,
                valgteBarn: [barn1],
            },
        });

        await sendInnSkjema();

        expect(await screen.findByText('Du må velge minst ett barn')).toBeInTheDocument();
    });

    test('viser ikke feilmelding når årsaken ikke har barn i brevet', async () => {
        const { sendInnSkjema, screen } = renderMedSkjema(<BarnCheckboxGruppeMedFieldArray />, {
            defaultValues: { årsak: DokumentÅrsak.KAN_SØKE_EØS, valgteBarn: [barn1] },
        });

        await sendInnSkjema();

        expect(screen.queryByText('Du må velge minst ett barn')).not.toBeInTheDocument();
    });

    test('merking av et barn oppdaterer skjemaverdiene og fjerner feilmeldingen', async () => {
        const { sendInnSkjema, screen, user, hentForm } = renderMedSkjema(<BarnCheckboxGruppeMedFieldArray />, {
            defaultValues: {
                årsak: DokumentÅrsak.TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HAR_FÅTT_EN_SØKNAD_FRA_ANNEN_FORELDER,
                valgteBarn: [barn1],
            },
        });

        await sendInnSkjema();
        expect(await screen.findByText('Du må velge minst ett barn')).toBeInTheDocument();

        await user.click(screen.getByRole('checkbox', { name: /Eldst Barnesen/ }));

        const valgteBarn = hentForm().getValues('valgteBarn') as IBarnMedOpplysninger[];
        expect(valgteBarn[0].merket).toBe(true);
        expect(screen.queryByText('Du må velge minst ett barn')).not.toBeInTheDocument();
    });

    test('barn uten ident kan merkes uavhengig av hverandre', async () => {
        const annetBarnUtenIdent: IBarnMedOpplysninger = {
            ...manueltRegistrertBarnUtenIdent,
            navn: 'Annet Barnesen',
            fødselsdato: '2021-01-01',
        };
        const { screen, user, hentForm } = renderMedSkjema(<BarnCheckboxGruppeMedFieldArray />, {
            defaultValues: { valgteBarn: [manueltRegistrertBarnUtenIdent, annetBarnUtenIdent] },
        });

        await user.click(screen.getByRole('checkbox', { name: /Manuelt Barnesen/ }));

        const valgteBarn = hentForm().getValues('valgteBarn') as IBarnMedOpplysninger[];
        expect(valgteBarn[0].merket).toBe(true);
        expect(valgteBarn[1].merket).toBe(false);
    });

    test('sorterer barna etter fødselsdato, yngst barn øverst', () => {
        const { screen } = renderMedSkjema(<BarnCheckboxGruppeMedFieldArray />, {
            defaultValues: { valgteBarn: [barn1, barn2] },
        });

        const checkboxer = screen.getAllByRole('checkbox');
        expect(checkboxer[0]).toHaveAccessibleName(/Yngst Barnesen/);
        expect(checkboxer[1]).toHaveAccessibleName(/Eldst Barnesen/);
    });

    test('viser fjern-knapp kun for manuelt registrerte barn, og fjerner barnet ved klikk', async () => {
        const { screen, user, hentForm } = renderMedSkjema(<BarnCheckboxGruppeMedFieldArray />, {
            defaultValues: { valgteBarn: [barn1, manueltRegistrertBarn] },
        });

        expect(screen.queryByRole('button', { name: 'Fjern barn' })).toBeInTheDocument();
        expect(screen.getAllByRole('button', { name: 'Fjern barn' })).toHaveLength(1);

        await user.click(screen.getByRole('button', { name: 'Fjern barn' }));

        const valgteBarn = hentForm().getValues('valgteBarn') as IBarnMedOpplysninger[];
        expect(valgteBarn).toHaveLength(1);
        expect(valgteBarn[0].ident).toBe(barn1.ident);
    });

    test('viser avkryssing skrivebeskyttet og skjuler fjern-knappen i lesevisning', () => {
        const { screen } = renderMedSkjema(<BarnCheckboxGruppeMedFieldArray />, {
            defaultValues: { valgteBarn: [barn1, manueltRegistrertBarn] },
            fagsak: lagFagsak({ status: FagsakStatus.LÅST }),
        });

        expect(screen.getByTitle('Skrivebeskyttet')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Fjern barn' })).not.toBeInTheDocument();
    });
});
