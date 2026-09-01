import { createContext, useContext, useMemo } from 'react';

import type { IBarnMedOpplysninger } from '@typer/søknad';
import type { Control, FieldArrayMethodProps, FieldArrayWithId } from 'react-hook-form';
import { useFieldArray, useWatch } from 'react-hook-form';

import { finnBarnIBrevÅrsak } from '../barnIBrevÅrsak';
import type { DokumentutsendingFormValues } from '../useDokumentutsendingSkjema';
import { DokumentutsendingFeltnavn } from '../useDokumentutsendingSkjema';

interface ValgteBarnFieldArray {
    valgteBarn: FieldArrayWithId<DokumentutsendingFormValues, DokumentutsendingFeltnavn.VALGTE_BARN>[];
    leggTilBarn: (barn: IBarnMedOpplysninger, options?: FieldArrayMethodProps) => void;
    oppdaterBarn: (index: number, barn: IBarnMedOpplysninger) => void;
    fjernBarn: (index: number) => void;
}

const ValgteBarnFieldArrayContext = createContext<ValgteBarnFieldArray | undefined>(undefined);

interface Props {
    control: Control<DokumentutsendingFormValues>;
    children: React.ReactNode | ((fieldArray: ValgteBarnFieldArray) => React.ReactNode);
}

export function ValgteBarnFieldArrayProvider({ control, children }: Props) {
    const årsak = useWatch({ control, name: DokumentutsendingFeltnavn.ÅRSAK });
    const { fields, append, update, remove } = useFieldArray({
        control,
        name: DokumentutsendingFeltnavn.VALGTE_BARN,
        rules: {
            validate: barna =>
                finnBarnIBrevÅrsak(årsak || undefined) === undefined || barna.some(barn => barn.merket)
                    ? undefined
                    : 'Du må velge minst ett barn',
        },
    });

    const value = useMemo<ValgteBarnFieldArray>(
        () => ({
            valgteBarn: fields,
            leggTilBarn: append,
            oppdaterBarn: update,
            fjernBarn: remove,
        }),
        [fields, append, update, remove]
    );

    return (
        <ValgteBarnFieldArrayContext.Provider value={value}>
            {typeof children === 'function' ? children(value) : children}
        </ValgteBarnFieldArrayContext.Provider>
    );
}

export function useValgteBarnFieldArray() {
    const context = useContext(ValgteBarnFieldArrayContext);
    if (context === undefined) {
        throw new Error('useValgteBarnFieldArray må brukes innenfor en ValgteBarnFieldArrayProvider');
    }
    return context;
}
