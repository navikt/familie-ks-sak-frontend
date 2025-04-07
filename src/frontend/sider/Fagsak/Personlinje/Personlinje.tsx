import React from 'react';

import { BodyShort, Link, Spacer } from '@navikt/ds-react';
import { kjønnType } from '@navikt/familie-typer';
import Visittkort from '@navikt/familie-visittkort';

import Behandlingsmeny from './Behandlingsmeny/Behandlingsmeny';
import { useApp } from '../../../context/AppContext';
import DødsfallTag from '../../../komponenter/DødsfallTag';
import type { IMinimalFagsak } from '../../../typer/fagsak';
import type { IPersonInfo } from '../../../typer/person';
import { formaterIdent, hentAlder } from '../../../utils/formatter';

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
            dempetKantlinje
            padding
        >
            <div>|</div>
            <BodyShort>{`Kommunenr: ${bruker?.kommunenummer ?? 'ukjent'}`}</BodyShort>
            {bruker?.dødsfallDato?.length && (
                <>
                    <div>|</div>
                    <DødsfallTag dødsfallDato={bruker.dødsfallDato} />
                </>
            )}
            <Spacer />
            {minimalFagsak !== undefined && (
                <>
                    <Link href={`/fagsak/${minimalFagsak.id}/saksoversikt`}>
                        <BodyShort>Saksoversikt</BodyShort>
                    </Link>
                    <Link href={`/fagsak/${minimalFagsak.id}/dokumenter`}>
                        <BodyShort>Dokumenter</BodyShort>
                    </Link>
                    {harInnloggetSaksbehandlerSkrivetilgang() && (
                        <Behandlingsmeny minimalFagsak={minimalFagsak} />
                    )}
                </>
            )}
        </Visittkort>
    );
};

export default Personlinje;
