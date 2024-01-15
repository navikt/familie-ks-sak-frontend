import React from 'react';

import { BodyShort, Link } from '@navikt/ds-react';
import { kjønnType } from '@navikt/familie-typer';
import Visittkort from '@navikt/familie-visittkort';

import Behandlingsmeny from './Behandlingsmeny/Behandlingsmeny';
import { useApp } from '../../../context/AppContext';
import type { IMinimalFagsak } from '../../../typer/fagsak';
import type { IPersonInfo } from '../../../typer/person';
import { formaterIdent, hentAlder } from '../../../utils/formatter';
import DødsfallTag from '../../Felleskomponenter/DødsfallTag';

interface IProps {
    bruker?: IPersonInfo;
    minimalFagsak?: IMinimalFagsak;
}

const Personlinje: React.FC<IProps> = ({ bruker, minimalFagsak }) => {
    const { harInnloggetSaksbehandlerSkrivetilgang } = useApp();
    return (
        <Visittkort
            navn={bruker?.navn ?? 'Ukjent'}
            ident={formaterIdent(bruker?.personIdent ?? '')}
            alder={hentAlder(bruker?.fødselsdato ?? '')}
            kjønn={bruker?.kjønn ?? kjønnType.UKJENT}
        >
            <div className="visittkort__pipe">|</div>
            <BodyShort>{`Kommunenr: ${bruker?.kommunenummer ?? 'ukjent'}`}</BodyShort>
            {bruker?.dødsfallDato?.length && (
                <>
                    <div className="visittkort__pipe"></div>
                    <DødsfallTag dødsfallDato={bruker.dødsfallDato} />
                </>
            )}
            <div style={{ flex: 1 }}></div>
            <div style={{ flex: 1 }}></div>
            {minimalFagsak !== undefined && (
                <>
                    <Link
                        className={'visittkort__lenke'}
                        href={`/fagsak/${minimalFagsak.id}/saksoversikt`}
                    >
                        <BodyShort>Saksoversikt</BodyShort>
                    </Link>
                    <Link
                        className={'visittkort__lenke'}
                        href={`/fagsak/${minimalFagsak.id}/dokumenter`}
                    >
                        <BodyShort>Dokumenter</BodyShort>
                    </Link>
                    {harInnloggetSaksbehandlerSkrivetilgang() && (
                        <Behandlingsmeny bruker={bruker} minimalFagsak={minimalFagsak} />
                    )}
                </>
            )}
        </Visittkort>
    );
};

export default Personlinje;
