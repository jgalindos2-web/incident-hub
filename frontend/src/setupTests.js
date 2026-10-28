import '@testing-library/jest-dom';
import React from 'react';

// Asegura compatibilidad con transformaciones JSX en entorno de pruebas jsdom
globalThis.React = React;
