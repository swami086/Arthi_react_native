import { registerRootComponent } from 'expo';
import App from './App';

// Initialize Rollbar
// Initialize Rollbar
import rollbar from './src/services/rollbar';

// Register global error handlers if not already handled by the Client constructor
// (The Client constructor in src/services/rollbar.ts already handles captureUncaught/captureUnhandledRejections)



// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
