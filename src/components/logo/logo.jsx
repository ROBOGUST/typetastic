import React from 'react';
import logoWhite from './logoWhite.jpg';
import styles from "./logo.module.css"

export default function Logo() {
  return (
    <div>
      <img src={logoWhite} className={styles.Logo} alt="Logo" />
    </div>
  );
}