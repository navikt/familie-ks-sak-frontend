import type { PropsWithChildren } from 'react';

import styled from 'styled-components';

const Container = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
`;

const Knapperekke = ({ children }: PropsWithChildren) => {
    return <Container>{children}</Container>;
};

export default Knapperekke;
