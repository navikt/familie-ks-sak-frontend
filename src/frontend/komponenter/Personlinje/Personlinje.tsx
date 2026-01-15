import type { PropsWithChildren } from 'react';

import { BodyShort, Box, CopyButton, HStack } from '@navikt/ds-react';
import { kjønnType } from '@navikt/familie-typer';

import { type IPersonInfo } from '../../typer/person';
import { formaterIdent, hentAlder } from '../../utils/formatter';
import { erAdresseBeskyttet } from '../../utils/validators';
import { PersonIkon } from '../PersonIkon';
import styles from './Personlinje.module.css';

interface Props {
    bruker?: IPersonInfo;
}

function InnholdContainer({ children }: PropsWithChildren) {
    return (
        <Box borderWidth={'0 0 1 0'} borderColor={'border-subtle'} paddingInline={'4'} paddingBlock={'2'}>
            {children}
        </Box>
    );
}

function Divider() {
    return <div>|</div>;
}

export function Personlinje({ bruker }: Props) {
    if (bruker === undefined) {
        return (
            <InnholdContainer>
                <HStack align={'center'} gap={'3 4'}>
                    <HStack align={'center'} gap={'3 4'}>
                        <PersonIkon kjønn={kjønnType.UKJENT} erBarn={false} />
                        <Divider />
                        <HStack align={'center'} gap={'1'}>
                            Personen er ikke identifisert
                        </HStack>
                    </HStack>
                </HStack>
            </InnholdContainer>
        );
    }

    return (
        <InnholdContainer>
            <HStack align={'center'} gap={'3 4'}>
                <HStack align={'center'} gap={'3 4'}>
                    <PersonIkon
                        kjønn={bruker.kjønn}
                        erBarn={hentAlder(bruker.fødselsdato ?? '') < 18}
                        erAdresseBeskyttet={erAdresseBeskyttet(bruker.adressebeskyttelseGradering)}
                        harTilgang={bruker.harTilgang}
                        erEgenAnsatt={bruker.erEgenAnsatt}
                    />
                    <HStack align={'center'} gap={'3 4'}>
                        <BodyShort as={'span'} weight={'semibold'}>
                            {bruker.navn} ({hentAlder(bruker.fødselsdato ?? '')} år)
                            {bruker.harFalskIdentitet && (
                                <BodyShort as={'span'} weight={'semibold'}>
                                    {' '}
                                    - <mark className={styles.falskIdentitet}>Falsk identitet</mark>
                                </BodyShort>
                            )}
                        </BodyShort>
                        <Divider />
                        <HStack align={'center'} gap={'1'}>
                            {formaterIdent(bruker.personIdent)}
                            <CopyButton copyText={bruker.personIdent.replace(' ', '')} size={'small'} />
                        </HStack>
                    </HStack>
                </HStack>
                <Divider />
                <BodyShort>{`Kommunenr: ${bruker.kommunenummer}`}</BodyShort>
            </HStack>
        </InnholdContainer>
    );
}
