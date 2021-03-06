import * as moment from 'moment';
import Modal from 'nav-frontend-modal';
import 'nav-frontend-tabell-style';
import { Element, Normaltekst, Undertittel } from 'nav-frontend-typografi';
import * as React from 'react';
import { AdresseType, IPerson, IPersonAdresse } from '../../../typer/person';
import {
    formaterDato,
    formaterNavn,
    hentBotid,
    hentSammenlagtBotid,
} from '../../../utils/hjelpere';

interface IProps {
    person: IPerson;
    settÅpen: (åpen: boolean) => void;
    åpen: boolean;
}

const AdressehistorikkModal: React.StatelessComponent<IProps> = ({ person, settÅpen, åpen }) => {
    const bostedsadresser: IPersonAdresse[] = person.personhistorikk.adresser.filter(
        (adresse: IPersonAdresse) => AdresseType.BOSTEDSADRESSE === adresse.adresseType
    );
    return (
        <Modal
            contentClass={'adressehistorikkmodal'}
            isOpen={åpen}
            closeButton={true}
            onRequestClose={() => {
                settÅpen(!åpen);
            }}
            contentLabel="Adressehistorikk"
        >
            <Undertittel children={`Adressehistorikk for ${formaterNavn(person.navn)}`} />

            <Element
                className={'adressehistorikkmodal__sammenlagtbotid'}
                children={`Sammenlagt botid i Norge basert på adressehistorikk: ${hentSammenlagtBotid(
                    bostedsadresser
                )}`}
            />

            <table className="tabell">
                <thead>
                    <tr>
                        <th>Adresse</th>
                        <th>Periode</th>
                        <th>Botid</th>
                    </tr>
                </thead>
                <tbody>
                    {bostedsadresser
                        .sort((a, b) => moment(b.periode.tomDato).diff(moment(a.periode.tomDato)))
                        .map((adresse: IPersonAdresse, index: number) => {
                            return (
                                <tr key={index}>
                                    <td>
                                        <div>
                                            {adresse.adresselinje1 ? (
                                                <React.Fragment>
                                                    <Normaltekst children={adresse.adresselinje1} />
                                                    <Normaltekst
                                                        children={`${adresse.postnummer} ${adresse.poststed}`}
                                                    />
                                                    <Normaltekst children={adresse.land} />
                                                </React.Fragment>
                                            ) : (
                                                <Normaltekst children={'Ukjent adresse'} />
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <Normaltekst
                                            children={`${formaterDato(
                                                adresse.periode.fomDato,
                                                person.fødselsdato
                                            )} - ${formaterDato(
                                                adresse.periode.tomDato,
                                                person.fødselsdato
                                            )}`}
                                        />
                                    </td>
                                    <td>
                                        <Normaltekst children={hentBotid(adresse.periode)} />
                                    </td>
                                </tr>
                            );
                        })}
                </tbody>
            </table>
        </Modal>
    );
};

export default AdressehistorikkModal;
