/**
 * WizardContext — lets the WizardShell publish the user's wizard answers
 * so the underlying "Advanced Settings" UI can read & pre-populate them.
 *
 * Consumers (SocialAI, EPK, etc.) call useWizard() to read { state, appliedFromWizard }.
 */
import React, { createContext, useContext } from 'react';

const WizardContext = createContext({ state: {}, appliedFromWizard: false });

export const WizardProvider = ({ value, children }) => (
  <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
);

export const useWizard = () => useContext(WizardContext);
