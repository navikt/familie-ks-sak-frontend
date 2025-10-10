import type { PropsWithChildren } from 'react';

import styled from 'styled-components';

const StyledLegend = styled.legend`
    position: absolute;
    clip: rect(0 0 0 0);
`;

const SkjultLegend = ({ children }: PropsWithChildren) => <StyledLegend>{children}</StyledLegend>;

export default SkjultLegend;
