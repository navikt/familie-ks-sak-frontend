import React from 'react';

import { BodyShort, Box, CopyButton, HStack } from '@navikt/ds-react';
import { kjønnType } from '@navikt/familie-typer';

import { PersonIkon } from '../../../komponenter/PersonIkon';
import { type IPersonInfo } from '../../../typer/person';
import { hentAlder } from '../../../utils/formatter';
import { erAdresseBeskyttet } from '../../../utils/validators';

interface IProps {
    bruker?: IPersonInfo;
}

const InnholdContainer = ({ children }: React.PropsWithChildren) => {
    return (
        <Box borderWidth="0 0 1 0" borderColor="border-subtle" paddingInline="4" paddingBlock="2">
            {children}
        </Box>
    );
};

const Divider = () => {
    return <div>|</div>;
};

const Personlinje: React.FC<IProps> = ({ bruker }) => {
    return (
        <InnholdContainer>
            <HStack align="center" gap="3 4">
                <HStack align="center" gap="3 4">
                    <PersonIkon
                        kjønn={bruker?.kjønn ?? kjønnType.UKJENT}
                        erBarn={hentAlder(bruker?.fødselsdato ?? '') < 18}
                        erAdresseBeskyttet={erAdresseBeskyttet(bruker?.adressebeskyttelseGradering)}
                        harTilgang={bruker?.harTilgang}
                    />
                    <BodyShort as="span" weight="semibold">
                        {bruker?.navn} ({hentAlder(bruker?.fødselsdato ?? '')} år)
                    </BodyShort>
                    <Divider />
                    <HStack align="center" gap="1">
                        {bruker?.personIdent}
                        <CopyButton
                            copyText={bruker?.personIdent.replace(' ', '') || 'bleg'}
                            size="small"
                        />
                    </HStack>
                </HStack>
                <Divider />
                <BodyShort>{`Kommunenr: ${bruker?.kommunenummer}`}</BodyShort>
            </HStack>
        </InnholdContainer>
    );
};

export default Personlinje;
