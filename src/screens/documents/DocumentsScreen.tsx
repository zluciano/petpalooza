import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import * as DocumentPicker from 'expo-document-picker';
import { Card, Button, EmptyState, IconButton, Select } from '../../components';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { usePetStore } from '../../store/petStore';
import { supabase } from '../../services/supabase';
import { format } from 'date-fns';
import type { Document } from '../../types';

type Props = {
  navigation: StackNavigationProp<any>;
};

const documentTypeOptions = [
  { label: 'Vaccination Record', value: 'vaccination', icon: '💉' },
  { label: 'Medical Record', value: 'medical_record', icon: '🏥' },
  { label: 'Legal Custody', value: 'custody', icon: '📜' },
  { label: 'Insurance', value: 'insurance', icon: '🛡️' },
  { label: 'Other', value: 'other', icon: '📄' },
];

const documentTypeIcons: Record<string, string> = {
  vaccination: '💉',
  medical_record: '🏥',
  custody: '📜',
  insurance: '🛡️',
  other: '📄',
};

export function DocumentsScreen({ navigation }: Props) {
  const { selectedPet } = usePetStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (selectedPet) {
      fetchDocuments();
    }
  }, [selectedPet]);

  const fetchDocuments = async () => {
    if (!selectedPet) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('pet_id', selectedPet.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
    setLoading(false);
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setUploading(true);

      const response = await fetch(file.uri);
      const blob = await response.blob();
      const filename = `${Date.now()}-${file.name}`;
      const path = `documents/${selectedPet?.id}/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from('pets')
        .upload(path, blob, { contentType: file.mimeType || 'application/octet-stream' });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('pets')
        .getPublicUrl(path);

      const { error: dbError } = await supabase.from('documents').insert({
        pet_id: selectedPet?.id,
        name: file.name,
        type: 'other',
        file_url: publicUrl,
        file_type: file.mimeType || 'application/octet-stream',
        file_size: file.size || 0,
      });

      if (dbError) throw dbError;

      await fetchDocuments();
      Alert.alert('Success', 'Document uploaded successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to upload document');
    }
    setUploading(false);
  };

  const handleDeleteDocument = (doc: Document) => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${doc.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase.from('documents').delete().eq('id', doc.id);
              await fetchDocuments();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleOpenDocument = (doc: Document) => {
    Linking.openURL(doc.file_url);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!selectedPet) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Pet not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Documents</Text>
        <Text style={styles.subtitle}>
          Store {selectedPet.name}'s important documents
        </Text>
      </View>

      <Button
        title="Upload Document"
        onPress={handlePickDocument}
        loading={uploading}
        style={styles.uploadButton}
        icon={<Text>📎</Text>}
      />

      {documents.length === 0 && !loading ? (
        <EmptyState
          icon="📁"
          title="No documents yet"
          description="Upload vaccination records, medical documents, or custody papers"
        />
      ) : (
        <FlatList
          data={documents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={styles.documentCard} onPress={() => handleOpenDocument(item)}>
              <View style={styles.documentContent}>
                <View style={styles.documentIcon}>
                  <Text style={styles.documentEmoji}>
                    {documentTypeIcons[item.type] || '📄'}
                  </Text>
                </View>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.documentMeta}>
                    {formatFileSize(item.file_size)} • {format(new Date(item.created_at), 'MMM d, yyyy')}
                  </Text>
                </View>
                <IconButton
                  icon="🗑️"
                  variant="ghost"
                  size="sm"
                  onPress={() => handleDeleteDocument(item)}
                />
              </View>
            </Card>
          )}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={fetchDocuments}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  uploadButton: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  list: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  documentCard: {
    marginBottom: spacing.sm,
  },
  documentContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  documentEmoji: {
    fontSize: 24,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    ...typography.body,
    fontWeight: '500',
    color: colors.text,
  },
  documentMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
