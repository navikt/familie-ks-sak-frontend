import { Fragment } from 'react';

import { useBehandling } from '@hooks/useBehandling';
import type { IVedtaksperiodeMedBegrunnelser } from '@typer/vedtaksperiode';
import { Vedtaksperiodetype } from '@typer/vedtaksperiode';
import { partition } from '@utils/commons';
import styled from 'styled-components';

import { Heading, HelpText } from '@navikt/ds-react';

import { filtrerOgSorterPerioderMedBegrunnelseBehov } from './utils';
import { Vedtaksperiode } from './Vedtaksperiode';
import { VedtaksperiodeProvider } from './VedtaksperiodeContext';

const StyledHeading = styled(Heading)`
    display: flex;
    margin-top: 1rem;
`;

const StyledHelpText = styled(HelpText)`
    margin-top: 0.1rem;
    margin-left: 0.6rem;

    & + .aksel-popover {
        max-width: 20rem;
    }
`;

export function Vedtaksperioder() {
    const behandling = useBehandling();

    const sorterteVedtaksperioderSomSkalvises = filtrerOgSorterPerioderMedBegrunnelseBehov(
        behandling.vedtak?.vedtaksperioderMedBegrunnelser ?? [],
        behandling.resultat,
        behandling.status,
        behandling.sisteVedtaksperiodeVisningDato
    );

    const [sorterteAvslagsperioder, sorterteAndreVedtaksperioder] = partition(
        vedtaksperiode => vedtaksperiode.type === Vedtaksperiodetype.AVSLAG,
        sorterteVedtaksperioderSomSkalvises
    );

    return sorterteVedtaksperioderSomSkalvises.length > 0 ? (
        <>
            <GrupperteVedtaksperioder
                sorterteVedtaksperioderMedBegrunnelser={sorterteAndreVedtaksperioder}
                overskrift={'Begrunnelser i vedtaksbrev'}
                hjelpetekst={'Her skal du sette begrunnelsestekster for innvilgelse, reduksjon og opphør.'}
            />

            <GrupperteVedtaksperioder
                sorterteVedtaksperioderMedBegrunnelser={sorterteAvslagsperioder}
                overskrift={'Begrunnelser for avslag i vedtaksbrev'}
                hjelpetekst={'Her har vi hentet begrunnelser for avslag som er satt tidligere i behandlingen.'}
            />
        </>
    ) : (
        <Fragment />
    );
}

const GrupperteVedtaksperioder = ({
    sorterteVedtaksperioderMedBegrunnelser,
    overskrift,
    hjelpetekst,
}: {
    sorterteVedtaksperioderMedBegrunnelser: IVedtaksperiodeMedBegrunnelser[];
    overskrift: string;
    hjelpetekst: string;
}) => {
    if (sorterteVedtaksperioderMedBegrunnelser.length === 0) {
        return null;
    }

    const sisteVedtaksperiodeFom =
        sorterteVedtaksperioderMedBegrunnelser[sorterteVedtaksperioderMedBegrunnelser.length - 1].fom;

    return (
        <>
            <StyledHeading level="2" size="small" spacing>
                {overskrift}
                <StyledHelpText placement="right">{hjelpetekst}</StyledHelpText>
            </StyledHeading>
            {sorterteVedtaksperioderMedBegrunnelser.map(
                (vedtaksperiodeMedBegrunnelser: IVedtaksperiodeMedBegrunnelser) => (
                    <VedtaksperiodeProvider
                        key={vedtaksperiodeMedBegrunnelser.id}
                        vedtaksperiodeMedBegrunnelser={vedtaksperiodeMedBegrunnelser}
                    >
                        <Vedtaksperiode sisteVedtaksperiodeFom={sisteVedtaksperiodeFom} />
                    </VedtaksperiodeProvider>
                )
            )}
        </>
    );
};

export default Vedtaksperioder;
