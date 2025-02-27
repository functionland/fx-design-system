import React, { useEffect, useState } from 'react';
import {
  FxBottomSheetModal,
  FxBottomSheetModalMethods,
  FxBox,
  FxPressableOpacity,
  FxText,
  useFxTheme,
  APP_HORIZONTAL_PADDING,
} from '@functionland/component-library';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../constants/layout';
import { DynamicIcon } from '../components';
import { useMainTabsNavigation, useRootNavigation } from '../hooks';
import { Routes } from '../navigation/navigationConfig';
import { usePluginsStore } from '../stores/usePluginsStore'; // Import the plugins store
import { SvgUri } from 'react-native-svg';

type Plugin = {
  name: string;
  'icon-path': string;
  'icon-file'?: string;
};

type GlobalBottomSheetProps = {
  closeBottomSheet: VoidFunction;
};

export const GlobalBottomSheet = React.forwardRef<
  FxBottomSheetModalMethods,
  GlobalBottomSheetProps
>((_, ref) => {
  const navigation = useMainTabsNavigation();
  const navigationRoot = useRootNavigation();
  const theme = useFxTheme();
  const itemWidth = (SCREEN_WIDTH - APP_HORIZONTAL_PADDING * 2) / 4;
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const { listActivePlugins, activePlugins } = usePluginsStore(); // Use the plugins store

  useEffect(() => {
    // Fetch available plugins
    fetch(
      'https://raw.githubusercontent.com/functionland/fula-ota/refs/heads/main/docker/fxsupport/linux/plugins/info.json'
    )
      .then((response) => response.json())
      .then((data: Plugin[]) => setPlugins(data))
      .catch((error) => console.error('Error fetching plugins:', error));

    // Fetch active plugins
    listActivePlugins().catch((error) =>
      console.error('Error fetching active plugins:', error)
    );
  }, [listActivePlugins]);

  return (
    <FxBottomSheetModal ref={ref}>
      <FxBox height={SCREEN_HEIGHT * 0.75}>
        <FxText variant="bodyMediumRegular">Plugins</FxText>
        <FxBox paddingVertical="20" flexDirection="row" flexWrap="wrap">
        {plugins.map((plugin) => (
          <FxPressableOpacity
            key={plugin.name}
            width={itemWidth}
            alignItems="center"
            marginVertical="4"
            paddingVertical="4"
            onPress={() => {
              _.closeBottomSheet();
              navigation.navigate(Routes.PluginTab, { name: plugin.name });
            }}
          >
            {plugin['icon-path'] ? (
              <DynamicIcon
                iconPath={plugin['icon-path']}
                fill={theme.colors.primary}
              />
            ) : plugin['icon-file'] ? (
              <SvgUri
                uri={plugin['icon-file']}
                width={itemWidth}
                height={24}
                fill={theme.colors.primary}
                style={{ alignSelf: 'center', padding: 0, margin: 0 }}
              />
            ) : null}

            <FxText marginTop="4">{plugin.name}</FxText>
            
            {activePlugins.includes(plugin.name) && (
              <FxText variant="bodyXSLight" color="greenBase" marginTop="0">
                Installed
              </FxText>
            )}
          </FxPressableOpacity>
        ))}
        </FxBox>
      </FxBox>
    </FxBottomSheetModal>
  );
});
