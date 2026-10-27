import { useBruker } from '@hooks/useBruker';
import { type Brevmottaker, Brevmottakertype } from '@typer/brevmottaker';
import { formaterIdent, lagBrukerLabel } from '@utils/formatter';

interface Props {
    brevmottakere: Brevmottaker[];
}

export function BrevmottakerListe({ brevmottakere }: Props) {
    const bruker = useBruker();

    const harUtenlandskAdresse = brevmottakere.some(
        mottaker => mottaker.type === Brevmottakertype.BRUKER_MED_UTENLANDSK_ADRESSE
    );
    const harFullmektig = brevmottakere.some(mottaker => mottaker.type === Brevmottakertype.FULLMEKTIG);
    const harVerge = brevmottakere.some(mottaker => mottaker.type === Brevmottakertype.VERGE);
    const harManuellDødsboadresse = brevmottakere.some(mottaker => mottaker.type === Brevmottakertype.DØDSBO);

    const skalViseSøker = !harManuellDødsboadresse && !harUtenlandskAdresse;

    return (
        <ul>
            {skalViseSøker && <li>{lagBrukerLabel(bruker)}</li>}
            {harUtenlandskAdresse && !harFullmektig && <li>{lagBrukerLabel(bruker)} | Utenlandsk adresse</li>}
            {harUtenlandskAdresse && harFullmektig && (
                <li>
                    {bruker.navn} | {formaterIdent(bruker.personIdent)} | Utenlandsk adresse
                </li>
            )}
            {harManuellDødsboadresse && <li>{bruker.navn} | Dødsbo</li>}
            {harFullmektig &&
                brevmottakere
                    .filter(mottaker => mottaker.type === Brevmottakertype.FULLMEKTIG)
                    .map(mottaker => <li key={`fullmektig-${mottaker.navn}`}>{mottaker.navn} | Fullmektig</li>)}
            {harVerge &&
                brevmottakere
                    .filter(mottaker => mottaker.type === Brevmottakertype.VERGE)
                    .map(mottaker => <li key={`verge-${mottaker.navn}`}>{mottaker.navn} | Verge</li>)}
        </ul>
    );
}
