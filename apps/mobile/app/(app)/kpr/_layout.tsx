import { Stack } from 'expo-router';

export default function KPRLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Simulasi KPR',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="simulations" 
        options={{ 
          title: 'Simulasi Tersimpan',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: 'Detail Simulasi',
          headerShown: true,
        }} 
      />
    </Stack>
  );
}
