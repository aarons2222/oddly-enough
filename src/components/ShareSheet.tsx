import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  Platform,
  Linking,
  Share,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

interface Props {
  visible: boolean;
  onClose: () => void;
  title: string;
  url: string;
  summary?: string;
  imageUrl?: string;
  source?: string;
}

const SHARE_OPTIONS = [
  { id: 'card', label: 'Share Card', icon: 'image-outline', color: '#FF6B6B' },
  { id: 'copy', label: 'Copy Link', icon: 'copy-outline', color: '#666' },
  { id: 'twitter', label: 'Twitter/X', icon: 'logo-twitter', color: '#1DA1F2' },
  { id: 'whatsapp', label: 'WhatsApp', icon: 'logo-whatsapp', color: '#25D366' },
  { id: 'telegram', label: 'Telegram', icon: 'paper-plane', color: '#0088cc' },
  { id: 'more', label: 'More...', icon: 'ellipsis-horizontal', color: '#888' },
];

export function ShareSheet({ visible, onClose, title, url, summary, imageUrl, source }: Props) {
  const [showCard, setShowCard] = useState(false);
  
  const handleShare = async (optionId: string) => {
    const shareText = `${title}\n\n${url}`;
    
    switch (optionId) {
      case 'card':
        setShowCard(true);
        break;
        
      case 'copy':
        if (Platform.OS === 'web') {
          await navigator.clipboard.writeText(url);
        } else {
          await Clipboard.setStringAsync(url);
        }
        onClose();
        break;
        
      case 'twitter':
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        Linking.openURL(twitterUrl);
        onClose();
        break;
        
      case 'whatsapp':
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        Linking.openURL(whatsappUrl);
        onClose();
        break;
        
      case 'telegram':
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        Linking.openURL(telegramUrl);
        onClose();
        break;
        
      case 'more':
        if (Platform.OS === 'web' && navigator.share) {
          try {
            await navigator.share({ title, text: summary, url });
          } catch {}
        } else {
          await Share.share({ message: shareText, url });
        }
        onClose();
        break;
    }
  };
  
  const handleShareCard = async () => {
    // Share the card as text with link (image generation would need expo-view-shot)
    const cardText = `🔮 Oddly Enough\n\n"${title}"\n\n📰 ${source || 'Read more'}\n${url}`;
    if (Platform.OS === 'web' && navigator.share) {
      try {
        await navigator.share({ title: 'Oddly Enough', text: cardText });
      } catch {}
    } else {
      await Share.share({ message: cardText });
    }
    setShowCard(false);
    onClose();
  };
  
  // Share Card Preview
  if (showCard) {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setShowCard(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowCard(false)}>
          <View style={styles.cardContainer}>
            <View style={styles.shareCard}>
              {imageUrl && (
                <Image source={{ uri: imageUrl }} style={styles.cardImage} resizeMode="cover" />
              )}
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={3}>{title}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardBrand}>🔮 Oddly Enough</Text>
                  <Text style={styles.cardSource}>{source}</Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity style={styles.shareCardButton} onPress={handleShareCard}>
              <Ionicons name="share-outline" size={20} color="#fff" />
              <Text style={styles.shareCardButtonText}>Share This Card</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.backButton} onPress={() => setShowCard(false)}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
          <View style={styles.handle} />
          
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          <Text style={styles.url} numberOfLines={1}>{url}</Text>
          
          <View style={styles.options}>
            {SHARE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.option}
                onPress={() => handleShare(option.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconCircle, { backgroundColor: option.color + '20' }]}>
                  <Ionicons name={option.icon as any} size={24} color={option.color} />
                </View>
                <Text style={styles.optionLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
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
  sheet: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#444',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  url: {
    color: '#888',
    fontSize: 12,
    marginBottom: 24,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  option: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionLabel: {
    color: '#ccc',
    fontSize: 12,
  },
  cancelButton: {
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Share Card styles
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  shareCard: {
    width: 320,
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBrand: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
  cardSource: {
    color: '#888',
    fontSize: 12,
  },
  shareCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 24,
    gap: 8,
  },
  shareCardButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 16,
    padding: 12,
  },
  backButtonText: {
    color: '#888',
    fontSize: 14,
  },
});
