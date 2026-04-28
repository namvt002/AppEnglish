import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { NotesScreen } from '../screens/NotesScreen';
import { VocabScreen } from '../screens/VocabScreen';
import { RemindersScreen } from '../screens/RemindersScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

function tabLabel(focused: boolean, label: string) {
  return (
    <Text
      style={{
        fontSize: 11,
        color: focused ? colors.accent : colors.muted,
        fontWeight: focused ? '600' : '400',
      }}
    >
      {label}
    </Text>
  );
}

export function RootTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '600' },
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
        }}
    >
      <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Điểm danh',
            tabBarLabel: ({ focused }) => tabLabel(focused, 'Điểm danh'),
          }}
      />
      <Tab.Screen
        name="History"
          component={HistoryScreen}
          options={{
            title: 'Lịch sử',
            tabBarLabel: ({ focused }) => tabLabel(focused, 'Lịch sử'),
          }}
        />
        <Tab.Screen
          name="Stats"
          component={StatsScreen}
          options={{
            title: 'Thống kê',
            tabBarLabel: ({ focused }) => tabLabel(focused, 'Thống kê'),
          }}
        />
        <Tab.Screen
          name="Notes"
          component={NotesScreen}
          options={{
            title: 'Ghi chú',
            tabBarLabel: ({ focused }) => tabLabel(focused, 'Ghi chú'),
          }}
        />
        <Tab.Screen
          name="Vocab"
          component={VocabScreen}
          options={{
            title: 'Từ & phát âm',
            tabBarLabel: ({ focused }) => tabLabel(focused, 'Từ vựng'),
          }}
        />
        <Tab.Screen
          name="Reminders"
          component={RemindersScreen}
          options={{
            title: 'Nhắc nhở',
            tabBarLabel: ({ focused }) => tabLabel(focused, 'Nhắc nhở'),
          }}
        />
      </Tab.Navigator>
  );
}
