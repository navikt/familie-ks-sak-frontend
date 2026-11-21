export interface IPar {
    id: string;
    navn: string;
}

export interface INøkkelPar {
    [key: string]: IPar;
}

export type OptionType = {
    value: string;
    label: string;
};
