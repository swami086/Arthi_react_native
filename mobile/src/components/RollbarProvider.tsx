import React from 'react';
import { Provider } from 'rollbar-react-native';
import rollbar from '../services/rollbar';

const RollbarProvider = ({ children }: { children: React.ReactNode }) => {
  return <Provider client={rollbar}>{children}</Provider>;
};

export default RollbarProvider;
