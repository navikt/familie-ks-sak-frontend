import React from 'react';

import navFarger from 'nav-frontend-core';

import { Alert } from '@navikt/ds-react';
import type { ActionMeta, ISelectOption } from '@navikt/familie-form-elements';
import { FamilieReactSelect } from '@navikt/familie-form-elements';
import type { Felt } from '@navikt/familie-skjema';
import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../../context/behandlingContext/BehandlingContext';
import type {
    IRestVedtakBegrunnelseTilknyttetVilkår,
    VedtakBegrunnelse,
} from '../../../../typer/vedtak';
import { VedtakBegrunnelseType } from '../../../../typer/vedtak';
import type { VilkårType } from '../../../../typer/vilkår';
import { hentBakgrunnsfarge, hentBorderfarge } from '../../../../utils/vedtakUtils';
import { useVedtaksbegrunnelseTekster } from '../../Vedtak/VedtakBegrunnelserTabell/Context/VedtaksbegrunnelseTeksterContext';
import useAvslagBegrunnelseMultiselect from './useAvslagBegrunnelseMultiselect';

interface IProps {
    vilkårType: VilkårType;
    begrunnelser: Felt<VedtakBegrunnelse[]>;
}

interface IOptionType {
    value: string;
    label: string;
}

const AvslagBegrunnelseMultiselect: React.FC<IProps> = ({ vilkårType, begrunnelser }) => {
    const { erLesevisning } = useBehandling();
    const { vedtaksbegrunnelseTekster } = useVedtaksbegrunnelseTekster();

    const { avslagBegrunnelseTeksterForGjeldendeVilkår } =
        useAvslagBegrunnelseMultiselect(vilkårType);

    const valgteBegrunnlser = begrunnelser
        ? begrunnelser.verdi.map((valgtBegrunnelse: VedtakBegrunnelse) => ({
              value: valgtBegrunnelse?.toString() ?? '',
              label:
                  avslagBegrunnelseTeksterForGjeldendeVilkår.find(
                      (
                          restVedtakBegrunnelseTilknyttetVilkår: IRestVedtakBegrunnelseTilknyttetVilkår
                      ) => restVedtakBegrunnelseTilknyttetVilkår.id === valgtBegrunnelse
                  )?.navn ?? '',
          }))
        : [];

    const onChangeBegrunnelse = (action: ActionMeta<ISelectOption>) => {
        switch (action.action) {
            case 'select-option':
                if (action.option) {
                    begrunnelser.validerOgSettFelt([
                        ...begrunnelser.verdi,
                        action.option.value as VedtakBegrunnelse,
                    ]);
                } else {
                    throw new Error('Klarer ikke legge til begrunnelse');
                }
                break;
            case 'pop-value':
            case 'remove-value':
                begrunnelser.validerOgSettFelt(
                    begrunnelser.verdi.filter(
                        begrunnelse => begrunnelse !== action.removedValue?.value
                    )
                );
                break;
            case 'clear':
                begrunnelser.validerOgSettFelt([]);
                break;
            default:
                throw new Error('Ukjent action ved onChange på vedtakbegrunnelser');
        }
    };

    const muligeOptions: IOptionType[] = avslagBegrunnelseTeksterForGjeldendeVilkår.map(
        (begrunnelse: IRestVedtakBegrunnelseTilknyttetVilkår) => ({
            value: begrunnelse.id,
            label: begrunnelse.navn,
        })
    );

    if (vedtaksbegrunnelseTekster.status === RessursStatus.FEILET) {
        return <Alert variant="error">Klarte ikke å hente inn begrunnelser for vilkår.</Alert>;
    }

    return (
        <FamilieReactSelect
            value={valgteBegrunnlser}
            label={'Velg standardtekst i brev'}
            creatable={false}
            placeholder={'Velg begrunnelse(r)'}
            erLesevisning={erLesevisning()}
            isMulti={true}
            onChange={(_, action: ActionMeta<ISelectOption>) => {
                onChangeBegrunnelse(action);
            }}
            options={muligeOptions}
            propSelectStyles={{
                container: provided => ({
                    ...provided,
                    maxWidth: '25rem',
                }),
                groupHeading: provided => ({
                    ...provided,
                    textTransform: 'none',
                }),
                multiValue: provided => {
                    return {
                        ...provided,
                        backgroundColor: hentBakgrunnsfarge(VedtakBegrunnelseType.AVSLAG),
                        border: `1px solid ${hentBorderfarge(VedtakBegrunnelseType.AVSLAG)}`,
                        borderRadius: '0.5rem',
                    };
                },
                multiValueLabel: provided => ({
                    ...provided,
                    whiteSpace: 'pre-wrap',
                    textOverflow: 'hidden',
                    overflow: 'hidden',
                }),
                multiValueRemove: provided => ({
                    ...provided,
                    ':hover': {
                        backgroundColor: navFarger.navBla,
                        color: 'white',
                        borderRadius: '0 .4rem .4rem 0',
                    },
                }),
            }}
        />
    );
};

export default AvslagBegrunnelseMultiselect;
