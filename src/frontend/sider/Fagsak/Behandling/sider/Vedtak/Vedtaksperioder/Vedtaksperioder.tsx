import { Fragment } from 'react';

import styled from 'styled-components';

import { Heading, HelpText } from '@navikt/ds-react';

import { filtrerOgSorterPerioderMedBegrunnelseBehov } from './utils';
import Vedtaksperiode from './Vedtaksperiode';
import { VedtaksperiodeProvider } from './VedtaksperiodeContext';
import type { IBehandling } from '../../../../../../typer/behandling';
import type { IVedtaksperiodeMedBegrunnelser } from '../../../../../../typer/vedtaksperiode';
import { Vedtaksperiodetype } from '../../../../../../typer/vedtaksperiode';
import { partition } from '../../../../../../utils/commons';

const StyledHeading = styled(Heading)`
    display: flex;
    margin-top: 1rem;
`;

const StyledHelpText = styled(HelpText)`
    margin-top: 0.1rem;
    margin-left: 0.6rem;

    & + .navds-popover {
        max-width: 20rem;
    }
`;

interface VedtaksperioderProps {
    åpenBehandling: IBehandling;
}

const Vedtaksperioder = ({ åpenBehandling }: VedtaksperioderProps) => {
    const sorterteVedtaksperioderSomSkalvises = filtrerOgSorterPerioderMedBegrunnelseBehov(
        åpenBehandling.vedtak?.vedtaksperioderMedBegrunnelser ?? [],
        åpenBehandling.resultat,
        åpenBehandling.status,
        åpenBehandling.sisteVedtaksperiodeVisningDato
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
                åpenBehandling={åpenBehandling}
            />

            <GrupperteVedtaksperioder
                sorterteVedtaksperioderMedBegrunnelser={sorterteAvslagsperioder}
                overskrift={'Begrunnelser for avslag i vedtaksbrev'}
                hjelpetekst={'Her har vi hentet begrunnelser for avslag som er satt tidligere i behandlingen.'}
                åpenBehandling={åpenBehandling}
            />
        </>
    ) : (
        <Fragment />
    );
};

const GrupperteVedtaksperioder = ({
    sorterteVedtaksperioderMedBegrunnelser,
    overskrift,
    hjelpetekst,
    åpenBehandling,
}: {
    sorterteVedtaksperioderMedBegrunnelser: IVedtaksperiodeMedBegrunnelser[];
    overskrift: string;
    hjelpetekst: string;
    åpenBehandling: IBehandling;
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
                        åpenBehandling={åpenBehandling}
                        vedtaksperiodeMedBegrunnelser={vedtaksperiodeMedBegrunnelser}
                    >
                        <Vedtaksperiode
                            vedtaksperiodeMedBegrunnelser={vedtaksperiodeMedBegrunnelser}
                            sisteVedtaksperiodeFom={sisteVedtaksperiodeFom}
                        />
                    </VedtaksperiodeProvider>
                )
            )}
        </>
    );
};

export default Vedtaksperioder;
