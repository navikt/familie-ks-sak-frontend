import { erEtterEllerSammeDato, fødselsdatoGrenseLovendringFebruar2025 } from './dato';
import { Lovverk } from '../typer/lovverk';

export const utledLovverkMedAdopsjonsdato = (
    eksisterendeLovverk: Lovverk,
    adopsjonsdato?: Date
) => {
    if (
        eksisterendeLovverk === Lovverk.LOVENDRING_FEBRUAR_2025 ||
        (adopsjonsdato &&
            erEtterEllerSammeDato(adopsjonsdato, fødselsdatoGrenseLovendringFebruar2025))
    ) {
        return Lovverk.LOVENDRING_FEBRUAR_2025;
    } else return eksisterendeLovverk;
};
