import type { SkjemaBrevmottaker } from '../../../sider/Fagsak/Fagsaklinje/Behandlingsmeny/LeggTilEllerFjernBrevmottakere/useBrevmottakerSkjema';
import { Mottaker } from '../../../sider/Fagsak/Fagsaklinje/Behandlingsmeny/LeggTilEllerFjernBrevmottakere/useBrevmottakerSkjema';
import type { IPersonInfo } from '../../../typer/person';
import { formaterIdent, lagBrukerLabel } from '../../../utils/formatter';

interface IProps {
    bruker: IPersonInfo;
    brevmottakere: SkjemaBrevmottaker[];
}

const BrevmottakerListe: React.FC<IProps> = ({ bruker, brevmottakere }) => {
    const harUtenlandskAdresse = brevmottakere.some(
        mottaker => mottaker.type === Mottaker.BRUKER_MED_UTENLANDSK_ADRESSE
    );
    const harFullmektig = brevmottakere.some(mottaker => mottaker.type === Mottaker.FULLMEKTIG);
    const harVerge = brevmottakere.some(mottaker => mottaker.type === Mottaker.VERGE);
    const harManuellDødsboadresse = brevmottakere.some(mottaker => mottaker.type === Mottaker.DØDSBO);

    const skalViseSøker = !harManuellDødsboadresse && !harUtenlandskAdresse;

    return (
        <ul>
            {skalViseSøker && <li key="søker">{lagBrukerLabel(bruker)}</li>}
            {harUtenlandskAdresse && !harFullmektig && (
                <li key="utenlandsk-adresse">{lagBrukerLabel(bruker)} | Utenlandsk adresse</li>
            )}
            {harUtenlandskAdresse && harFullmektig && (
                <li key="kort-utenlandsk-adresse">
                    {bruker.navn} | {formaterIdent(bruker.personIdent)} | Utenlandsk adresse
                </li>
            )}
            {harManuellDødsboadresse && <li key="dødsbo">{bruker.navn} | Dødsbo</li>}
            {harFullmektig &&
                brevmottakere
                    .filter(mottaker => mottaker.type === Mottaker.FULLMEKTIG)
                    .map(mottaker => <li key={`fullmektig-${mottaker.navn}`}>{mottaker.navn} | Fullmektig</li>)}
            {harVerge &&
                brevmottakere
                    .filter(mottaker => mottaker.type === Mottaker.VERGE)
                    .map(mottaker => <li key={`verge-${mottaker.navn}`}>{mottaker.navn} | Verge</li>)}
        </ul>
    );
};

export default BrevmottakerListe;
