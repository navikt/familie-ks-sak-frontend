import { useErLesevisningFagsak } from '@hooks/useErLesevisningFagsak';
import { type BarnIBrevÅrsak, barnIBrevÅrsakTilTittel } from '@sider/Fagsak/Dokumentutsending/barnIBrevÅrsak';
import { sorterBarnEtterFødselsdato } from '@utils/formatter';
import type { FieldPath } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';

import { CheckboxGroup } from '@navikt/ds-react';

import { BarnCheckbox } from './BarnCheckbox';
import type { DokumentutsendingFormValues } from '../useDokumentutsendingSkjema';
import { DokumentutsendingFeltnavn } from '../useDokumentutsendingSkjema';
import { useValgteBarnFieldArray } from './ValgteBarnFieldArrayContext';

interface Props {
    barnIBrevÅrsak: BarnIBrevÅrsak;
}

export function BarnCheckboxGruppe({ barnIBrevÅrsak }: Props) {
    const erLesevisning = useErLesevisningFagsak();
    const {
        clearErrors,
        formState: { errors, isSubmitting },
    } = useFormContext<DokumentutsendingFormValues>();

    const { valgteBarn, oppdaterBarn, fjernBarn } = useValgteBarnFieldArray();

    const sorterteBarn = sorterBarnEtterFødselsdato(valgteBarn);
    const merkedeBarn = valgteBarn.filter(barn => barn.merket).map(barn => barn.id);

    const oppdaterBarnMedNyMerketStatus = (barnaSomErMerket: string[]) => {
        valgteBarn.forEach((barn, index) => {
            const merket = barnaSomErMerket.includes(barn.id);
            if (merket !== barn.merket) {
                oppdaterBarn(index, { ...barn, merket });
            }
        });
        clearErrors(`${DokumentutsendingFeltnavn.VALGTE_BARN}.root` as FieldPath<DokumentutsendingFormValues>);
    };

    return (
        <CheckboxGroup
            legend={barnIBrevÅrsakTilTittel[barnIBrevÅrsak]}
            error={errors[DokumentutsendingFeltnavn.VALGTE_BARN]?.root?.message}
            value={merkedeBarn}
            onChange={oppdaterBarnMedNyMerketStatus}
            readOnly={erLesevisning || isSubmitting}
        >
            {sorterteBarn.map(barn => {
                const index = valgteBarn.indexOf(barn);
                return <BarnCheckbox key={barn.id} barn={barn} onFjern={() => fjernBarn(index)} />;
            })}
        </CheckboxGroup>
    );
}
