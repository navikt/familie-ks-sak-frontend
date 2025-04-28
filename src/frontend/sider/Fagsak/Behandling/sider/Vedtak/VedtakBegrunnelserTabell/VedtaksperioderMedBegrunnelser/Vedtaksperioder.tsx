import React, { Fragment } from 'react';

import styled from 'styled-components';

import { Alert, Heading, HelpText } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import Vedtaksperiode from './Vedtaksperiode';
import { useApp } from '../../../../../../../context/AppContext';
import type { IBehandling } from '../../../../../../../typer/behandling';
import { ToggleNavn } from '../../../../../../../typer/toggles';
import type { IVedtaksperiodeMedBegrunnelser } from '../../../../../../../typer/vedtaksperiode';
import { Vedtaksperiodetype } from '../../../../../../../typer/vedtaksperiode';
import { partition } from '../../../../../../../utils/commons';
import { filtrerOgSorterPerioderMedBegrunnelseBehov } from '../../../../../../../utils/vedtakUtils';
import { useVedtaksbegrunnelseTekster } from '../Context/VedtaksbegrunnelseTeksterContext';
import { VedtaksperiodeProvider } from '../Context/VedtaksperiodeMedBegrunnelserContext';

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

const Vedtaksperioder: React.FC<VedtaksperioderProps> = ({ åpenBehandling }) => {
    const { vedtaksbegrunnelseTekster } = useVedtaksbegrunnelseTekster();
    const { toggles } = useApp();

    const sorterteVedtaksperioderSomSkalvises = filtrerOgSorterPerioderMedBegrunnelseBehov(
        åpenBehandling.vedtak?.vedtaksperioderMedBegrunnelser ?? [],
        åpenBehandling.resultat,
        åpenBehandling.status,
        åpenBehandling.sisteVedtaksperiodeVisningDato,
        toggles[ToggleNavn.skalAlltidViseAlleVedtaksperioder]
    );

    if (
        vedtaksbegrunnelseTekster.status === RessursStatus.FEILET ||
        vedtaksbegrunnelseTekster.status === RessursStatus.FUNKSJONELL_FEIL
    ) {
        return <Alert variant="error">Klarte ikke å hente inn begrunnelser for vedtak.</Alert>;
    }

    const [sorterteAvslagsperioder, sorterteAndreVedtaksperioder] = partition(
        vedtaksperiode => vedtaksperiode.type === Vedtaksperiodetype.AVSLAG,
        sorterteVedtaksperioderSomSkalvises
    );

    return sorterteVedtaksperioderSomSkalvises.length > 0 ? (
        <>
            <GrupperteVedtaksperioder
                sorterteVedtaksperioderMedBegrunnelser={sorterteAndreVedtaksperioder}
                overskrift={'Begrunnelser i vedtaksbrev'}
                hjelpetekst={
                    'Her skal du sette begrunnelsestekster for innvilgelse, reduksjon og opphør.'
                }
                åpenBehandling={åpenBehandling}
            />

            <GrupperteVedtaksperioder
                sorterteVedtaksperioderMedBegrunnelser={sorterteAvslagsperioder}
                overskrift={'Begrunnelser for avslag i vedtaksbrev'}
                hjelpetekst={
                    'Her har vi hentet begrunnelser for avslag som er satt tidligere i behandlingen.'
                }
                åpenBehandling={åpenBehandling}
            />
        </>
    ) : (
        <Fragment />
    );
};

const GrupperteVedtaksperioder: React.FC<{
    sorterteVedtaksperioderMedBegrunnelser: IVedtaksperiodeMedBegrunnelser[];
    overskrift: string;
    hjelpetekst: string;
    åpenBehandling: IBehandling;
}> = ({ sorterteVedtaksperioderMedBegrunnelser, overskrift, hjelpetekst, åpenBehandling }) => {
    if (sorterteVedtaksperioderMedBegrunnelser.length === 0) {
        return null;
    }

    const sisteVedtaksperiodeFom =
        sorterteVedtaksperioderMedBegrunnelser[sorterteVedtaksperioderMedBegrunnelser.length - 1]
            .fom;

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
