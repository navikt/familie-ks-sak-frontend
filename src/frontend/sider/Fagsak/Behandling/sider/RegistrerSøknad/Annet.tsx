import * as React from 'react';

import styled from 'styled-components';

import { Heading, Textarea } from '@navikt/ds-react';

import { useSøknadContext } from './SøknadContext';
import { useBehandlingContext } from '../../../Behandling/context/BehandlingContext';

const AnnetWrapper = styled.div`
    margin: 2rem 0;
`;

const Annet: React.FunctionComponent = () => {
    const { vurderErLesevisning } = useBehandlingContext();
    const { skjema } = useSøknadContext();
    const lesevisning = vurderErLesevisning();

    return (
        <AnnetWrapper>
            <Heading size={'medium'} level={'2'} children={'Annet'} />
            <br />
            <Textarea
                {...skjema.felter.endringAvOpplysningerBegrunnelse.hentNavInputProps(
                    skjema.visFeilmeldinger
                )}
                readOnly={lesevisning}
                label={!lesevisning && 'Ved endring av opplysningene er begrunnelse obligatorisk'}
                maxLength={2000}
            />
        </AnnetWrapper>
    );
};

export default Annet;
