import type { ButtonHTMLAttributes } from 'react';

import styles from './FamilieBaseKnapp.module.css';

const FamilieBaseKnapp = ({ children }: ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button className={styles.knapp}>{children}</button>
);

export default FamilieBaseKnapp;
