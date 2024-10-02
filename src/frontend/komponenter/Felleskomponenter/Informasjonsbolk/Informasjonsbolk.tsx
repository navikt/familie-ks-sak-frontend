import * as React from 'react';

import { styled } from 'styled-components';

import { BodyShort, Label } from '@navikt/ds-react';
import { ATextDefault } from '@navikt/ds-tokens/dist/tokens';

interface IInformasjon {
    label: string;
    tekst: string;
    tekstTitle?: string;
}

interface IProps {
    informasjon: IInformasjon[];
    infoTeksFarve?: string;
}

const InformasjonsbolkContainer = styled.div`
    column-count: 2;
    max-width: 30rem;
    padding: 0.5rem 0;
`;

const Informasjonsbolk: React.FC<IProps> = ({ informasjon, infoTeksFarve }) => {
    return (
        <InformasjonsbolkContainer>
            {informasjon.map((info: IInformasjon) => {
                return <BodyShort key={info.label + info.tekst} children={info.label} />;
            })}
            {informasjon.map((info: IInformasjon) => {
                return (
                    <Label
                        style={{ color: infoTeksFarve ?? ATextDefault, display: 'block' }}
                        title={info.tekstTitle}
                        key={info.tekst + info.label}
                        children={info.tekst}
                    />
                );
            })}
        </InformasjonsbolkContainer>
    );
};

export default Informasjonsbolk;
