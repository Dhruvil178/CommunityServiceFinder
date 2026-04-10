import 'react-native-gesture-handler';

import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { store, persistor } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './src/utils/theme';

import LoadingScreen from './src/components/ui/LoadingScreen';
import AchievementEngineBridge from './src/components/AchievementEngineBridge';
import AchievementModal from './src/components/AchievementModal';

export default function App() {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <SafeAreaProvider>
          <PaperProvider theme={theme}>
            <AchievementEngineBridge />
            <AppNavigator />
            <AchievementModal />
          </PaperProvider>
        </SafeAreaProvider>
      </PersistGate>
    </ReduxProvider>
  );
}
