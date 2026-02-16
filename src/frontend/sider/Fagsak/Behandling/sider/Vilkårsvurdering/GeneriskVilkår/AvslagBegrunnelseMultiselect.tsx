import { UNSAFE_Combobox } from '@navikt/ds-react';
import type { Felt } from '@navikt/familie-skjema';

import useAvslagBegrunnelseMultiselect from './useAvslagBegrunnelseMultiselect';
import type { OptionType } from '../../../../../../typer/common';
import type { Begrunnelse } from '../../../../../../typer/vedtak';
import type { Regelverk, VilkårType } from '../../../../../../typer/vilkår';
import { useBehandlingContext } from '../../../context/BehandlingContext';

interface IProps {
    vilkårType: VilkårType;
    begrunnelser: Felt<Begrunnelse[]>;
    regelverk?: Regelverk;
}

const AvslagBegrunnelseMultiselect = ({ vilkårType, begrunnelser, regelverk }: IProps) => {
    const { vurderErLesevisning } = useBehandlingContext();

    const { grupperteAvslagsbegrunnelser } = useAvslagBegrunnelseMultiselect(vilkårType, regelverk);

    const valgteBegrunnlser = begrunnelser
        ? begrunnelser.verdi.map((valgtBegrunnelse: Begrunnelse) => ({
              value: valgtBegrunnelse?.toString() ?? '',
              label:
                  grupperteAvslagsbegrunnelser.find(
                      (restVedtakBegrunnelseTilknyttetVilkår: OptionType) =>
                          restVedtakBegrunnelseTilknyttetVilkår.value === valgtBegrunnelse
                  )?.label ?? '',
          }))
        : [];

    const onChangeBegrunnelse = (option: string, isSelected: boolean) => {
        if (isSelected) {
            begrunnelser.validerOgSettFelt([...begrunnelser.verdi, option as Begrunnelse]);
        } else {
            begrunnelser.validerOgSettFelt(begrunnelser.verdi.filter(begrunnelse => begrunnelse !== option));
        }
    };

    return (
        <UNSAFE_Combobox
            selectedOptions={valgteBegrunnlser}
            label={'Velg standardtekst i brev'}
            placeholder={'Velg begrunnelse(r)'}
            readOnly={vurderErLesevisning()}
            isMultiSelect
            onToggleSelected={onChangeBegrunnelse}
            options={grupperteAvslagsbegrunnelser}
        />
    );
};

export default AvslagBegrunnelseMultiselect;
