import { isBefore } from 'date-fns';

import { fødselsdatoGrenseLovendringFebruar2025 } from './dato';
import { Lovverk } from '../typer/lovverk';

export const utledLovverk = (fødselsdato: Date, adopsjonsdato?: Date): Lovverk => {
    const fødselsdatoEllerAdopsjonsdato = adopsjonsdato ?? fødselsdato;

    if (isBefore(fødselsdatoEllerAdopsjonsdato, fødselsdatoGrenseLovendringFebruar2025)) {
        return Lovverk.FØR_LOVENDRING_2025;
    } else {
        return Lovverk.LOVENDRING_FEBRUAR_2025;
    }
};
