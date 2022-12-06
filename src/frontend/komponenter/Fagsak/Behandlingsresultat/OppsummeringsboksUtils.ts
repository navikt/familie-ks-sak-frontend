export const hentBarnehageplassBeskrivelse = (prosent: number, erPåvirketAvEndring: boolean) => {
    switch (true) {
        case erPåvirketAvEndring:
            return 'Ikke relevant';
        case prosent === 100:
            return 'Ingen plass';
        case prosent === 80:
            return 'Under 9 timer';
        case prosent === 60:
            return 'Mellom 9 og 16 timer';
        case prosent === 40:
            return 'Mellom 17 og 24 timer';
        case prosent === 20:
            return 'Mellom 25 og 32 timer';
        default:
            return 'Over 33 timer';
    }
};
