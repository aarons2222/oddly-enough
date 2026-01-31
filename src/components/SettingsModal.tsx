import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Switch,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp, lightTheme, darkTheme } from '../context/AppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function SettingsModal({ visible, onClose }: Props) {
  const { isDarkMode, toggleDarkMode, chaosMode, setChaosMode, bugsEnabled, setBugsEnabled } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable 
          style={[
            styles.container, 
            { 
              backgroundColor: theme.card,
              paddingBottom: insets.bottom + 20,
            }
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle bar */}
          <View style={styles.handleBar} />
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Settings List */}
          <View style={styles.settingsList}>
            {/* Dark Mode */}
            <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#1a1a2e' }]}>
                  <Ionicons name={isDarkMode ? "moon" : "sunny"} size={20} color="#FFD700" />
                </View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: '#767577', true: '#FF6B6B' }}
                thumbColor="#fff"
              />
            </View>

            {/* Bugs Toggle */}
            <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#1a3d1a' }]}>
                  <Text style={styles.iconEmoji}>🐛</Text>
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>Screen Bugs</Text>
                  <Text style={[styles.settingDesc, { color: theme.textMuted }]}>
                    Creepy crawlies
                  </Text>
                </View>
              </View>
              <Switch
                value={bugsEnabled}
                onValueChange={setBugsEnabled}
                trackColor={{ false: '#767577', true: '#27AE60' }}
                thumbColor="#fff"
              />
            </View>

            {/* Chaos Mode */}
            <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#2d1b4e' }]}>
                  <Text style={styles.iconEmoji}>🌀</Text>
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>Chaos Mode</Text>
                  <Text style={[styles.settingDesc, { color: theme.textMuted }]}>
                    Embrace the weird
                  </Text>
                </View>
              </View>
              <Switch
                value={chaosMode}
                onValueChange={setChaosMode}
                trackColor={{ false: '#767577', true: '#9B59B6' }}
                thumbColor="#fff"
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textMuted }]}>
              🛸 Oddly Enough v1.0
            </Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#666',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  settingsList: {
    gap: 0,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 18,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});
