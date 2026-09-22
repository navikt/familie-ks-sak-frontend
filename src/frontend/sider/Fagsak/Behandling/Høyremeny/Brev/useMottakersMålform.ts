import { useBehandlingContext } from '@sider/Fagsak/Behandling/context/BehandlingContext';
import type { IGrunnlagPerson } from '@typer/person';
import { PersonType } from '@typer/person';
import { Målform } from '@typer/søknad';
import { useFormContext } from 'react-hook-form';

import { Valideringsstatus } from '@navikt/familie-skjema';

import { BrevmodulFeltnavn, type BrevModulFormValues } from './useBrevModul';

export const mottakersMålformImplementering = (
    personer: IGrunnlagPerson[],
    skjemaValideringsStatus: Valideringsstatus,
    mottakerIdent: string | readonly string[] | number
): Målform =>
    personer.find((person: IGrunnlagPerson) => {
        if (skjemaValideringsStatus === Valideringsstatus.OK) {
            return person.personIdent === mottakerIdent;
        } else {
            return person.type === PersonType.SØKER;
        }
    })?.målform ?? Målform.NB;

export const hentMottakersMålform = (personer: IGrunnlagPerson[], mottakerIdent: string): Målform =>
    mottakersMålformImplementering(
        personer,
        mottakerIdent.length >= 1 ? Valideringsstatus.OK : Valideringsstatus.IKKE_VALIDERT,
        mottakerIdent
    );

export function useMottakersMålform(): Målform {
    const { behandling } = useBehandlingContext();
    const { watch } = useFormContext<BrevModulFormValues>();
    const mottakerIdent = watch(BrevmodulFeltnavn.MOTTAKER_IDENT);
    return hentMottakersMålform(behandling.personer, mottakerIdent);
}
