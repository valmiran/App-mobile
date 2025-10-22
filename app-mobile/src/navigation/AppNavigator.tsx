import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

import { useAuth } from '../context/Authcontext';
import { colors } from '../Theme/colors';
import StatusBarOperacao from '../Components/StatusBarOperacao';

// ---- TELAS EXISTENTES ----
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import LLScreen from '../screens/LLScreen';
import ProcessosScreen from '../screens/ProcessosScreen';
import VoosScreen from '../screens/voosscreen';
import EmbarqueScreen from '../screens/EmbarqueScreen';
import PistaScreen from '../screens/PistaScreen';
import MalhaScreen from '../screens/MalhaScreen';
import RelatorioScreen from '../screens/RelatorioScreen';

// ---- NOVAS TELAS ----
import ItemsScreen from '../screens/ItemsScreen';
import AQDReportScreen from '../screens/AQDReportScreen';
import ConnectivityScreen from '../screens/ConnectivityScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// -------------------- STACK DE OPERAÇÕES --------------------
function OperacoesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Embarque" component={EmbarqueScreen} />
      <Stack.Screen name="Pista" component={PistaScreen} />
      <Stack.Screen name="Relatorio" component={RelatorioScreen} />

      {/* Novas telas dentro de Operações */}
      <Stack.Screen
        name="Items"
        component={ItemsScreen}
        options={{ headerShown: true, title: 'Listagem (FlatList)' }}
      />
      <Stack.Screen
        name="AQDReport"
        component={AQDReportScreen}
        options={{ headerShown: true, title: 'AQD - Reporte de Segurança' }}
      />
      <Stack.Screen
        name="Connectivity"
        component={ConnectivityScreen}
        options={{ headerShown: true, title: 'Conectividade (GPS/Rede)' }}
      />
    </Stack.Navigator>
  );
}

// -------------------- HEADER CUSTOM --------------------
function CustomHeader({ title }: { title: string }) {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.headerContainer}>
      {/* Ícone/logo à esquerda */}
      <MaterialCommunityIcons
        name="airplane-takeoff"
        size={26}
        color={colors.primary}
        style={{ marginLeft: 12 }}
      />

      {/* Centro com título + saudação */}
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>{title || 'Airport Agent'}</Text>
        {user && <Text style={styles.headerSubtitle}>👋 Olá, seja bem-vindo, {user.name}</Text>}
      </View>

      {/* Ações rápidas à direita */}
      <View style={styles.headerActions}>
        <MaterialCommunityIcons
          name="bell-outline"
          size={22}
          color={colors.text}
          style={{ marginRight: 16 }}
          onPress={() => alert('Notificações em breve')}
        />
        <MaterialCommunityIcons
          name="exit-to-app"
          size={22}
          color={colors.danger}
          style={{ marginRight: 12 }}
          onPress={signOut}
        />
      </View>
    </View>
  );
}

// -------------------- TABS --------------------
function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        header: () => (
          <SafeAreaView edges={['top']} style={{ backgroundColor: '#0B1220' }}>
            <CustomHeader title={route.name} />
            <StatusBarOperacao />
          </SafeAreaView>
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: '#0B1220', borderTopColor: colors.border },
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case 'Dashboard':
              return <MaterialCommunityIcons name="chart-line" size={size} color={color} />;
            case 'LL':
              return <MaterialCommunityIcons name="bag-suitcase" size={size} color={color} />;
            case 'Processos':
              return <FontAwesome5 name="clipboard-list" size={size} color={color} />;
            case 'Voos':
              return <MaterialCommunityIcons name="airplane" size={size} color={color} />;
            case 'Operações':
              return <MaterialCommunityIcons name="airplane-landing" size={size} color={color} />;
            case 'Malha':
              return <MaterialCommunityIcons name="access-point-network" size={size} color={color} />;
            default:
              return <MaterialCommunityIcons name="circle-outline" size={size} color={color} />;
          }
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="LL" component={LLScreen} />
      <Tab.Screen name="Processos" component={ProcessosScreen} />
      <Tab.Screen name="Voos" component={VoosScreen} />
      <Tab.Screen name="Operações" component={OperacoesStack} />
      <Tab.Screen name="Malha" component={MalhaScreen} />
    </Tab.Navigator>
  );
}

// -------------------- ROOT NAVIGATOR --------------------
export default function AppNavigator() {
  const { user } = useAuth();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Tabs" component={Tabs} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

// -------------------- STYLES --------------------
const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#0B1220',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: colors.text,
    fontSize: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
