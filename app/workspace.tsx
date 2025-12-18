import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/hooks/use-auth';
import {
  CollaborativeWorkspace,
  WorkspaceMember,
  CollaborativePrompt,
  getUserWorkspaces,
  createWorkspace,
  joinWorkspace,
  createCollaborativePrompt,
  updateCollaborativePrompt,
  subscribeToWorkspace,
  generateInviteLink,
} from '@/lib/collaboration';

export default function WorkspaceScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({ light: '#E5E4E2', dark: '#333333' }, 'icon');

  const [workspaces, setWorkspaces] = useState<CollaborativeWorkspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<CollaborativeWorkspace | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [promptHistory, setPromptHistory] = useState<CollaborativePrompt[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  useEffect(() => {
    if (user) {
      loadWorkspaces();
    }
  }, [user]);

  useEffect(() => {
    if (selectedWorkspace) {
      // Subscribe to workspace updates
      const unsubscribe = subscribeToWorkspace(selectedWorkspace.id, {
        onMemberJoin: (member) => {
          console.log('Member joined:', member);
          loadWorkspaces(); // Refresh workspace data
        },
        onMemberLeave: (userId) => {
          console.log('Member left:', userId);
          loadWorkspaces();
        },
        onCursorMove: (userId, x, y) => {
          // Update cursor position in UI
          console.log(`Cursor moved: ${userId} at (${x}, ${y})`);
        },
        onPromptUpdate: (prompt) => {
          setPromptHistory(prev => [prompt, ...prev.filter(p => p.promptId !== prompt.promptId)]);
        },
      });

      return () => unsubscribe();
    }
  }, [selectedWorkspace]);

  const loadWorkspaces = async () => {
    if (!user) return;
    const userWorkspaces = await getUserWorkspaces(user.id.toString());
    setWorkspaces(userWorkspaces);
  };

  const handleCreateWorkspace = async () => {
    if (!user || !newWorkspaceName.trim()) {
      Alert.alert('Error', 'Please enter a workspace name');
      return;
    }

    try {
      const workspace = await createWorkspace(
        user.id.toString(),
        user.name || user.email || 'User',
        newWorkspaceName
      );
      setWorkspaces(prev => [workspace, ...prev]);
      setNewWorkspaceName('');
      setShowCreateModal(false);
      setSelectedWorkspace(workspace);
    } catch (error) {
      Alert.alert('Error', 'Failed to create workspace');
    }
  };

  const handleSelectWorkspace = async (workspace: CollaborativeWorkspace) => {
    if (!user) return;

    try {
      const joined = await joinWorkspace(
        workspace.id,
        user.id.toString(),
        user.name || user.email || 'User'
      );
      if (joined) {
        setSelectedWorkspace(joined);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to join workspace');
    }
  };

  const handleSendPrompt = async () => {
    if (!selectedWorkspace || !user || !currentPrompt.trim()) return;

    try {
      const prompt = await createCollaborativePrompt(
        selectedWorkspace.id,
        currentPrompt,
        user.id.toString()
      );
      setPromptHistory(prev => [prompt, ...prev]);
      setCurrentPrompt('');
    } catch (error) {
      Alert.alert('Error', 'Failed to send prompt');
    }
  };

  const handleShareWorkspace = () => {
    if (!selectedWorkspace) return;
    const link = generateInviteLink(selectedWorkspace.id);
    Alert.alert(
      'Invite Link',
      `Share this link to invite collaborators:\n\n${link}`,
      [
        { text: 'Copy', onPress: () => {/* TODO: Copy to clipboard */} },
        { text: 'Close' },
      ]
    );
  };

  const renderWorkspaceCard = ({ item }: { item: CollaborativeWorkspace }) => {
    const onlineMembers = item.members.filter(m => m.isOnline).length;
    const isOwner = user && item.ownerId === user.id.toString();

    return (
      <Pressable
        style={[
          styles.workspaceCard,
          { borderColor },
          selectedWorkspace?.id === item.id && { borderColor: tintColor, borderWidth: 2 },
        ]}
        onPress={() => handleSelectWorkspace(item)}
      >
        <View style={styles.workspaceHeader}>
          <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
          {isOwner && (
            <View style={[styles.ownerBadge, { backgroundColor: tintColor }]}>
              <ThemedText style={styles.ownerBadgeText}>Owner</ThemedText>
            </View>
          )}
        </View>

        <View style={styles.workspaceInfo}>
          <ThemedText style={styles.workspaceInfoText}>
            {item.members.length} member{item.members.length !== 1 ? 's' : ''}
          </ThemedText>
          <ThemedText style={styles.workspaceInfoText}>•</ThemedText>
          <ThemedText style={[styles.workspaceInfoText, { color: '#4CAF50' }]}>
            {onlineMembers} online
          </ThemedText>
        </View>
      </Pressable>
    );
  };

  const renderMember = ({ item }: { item: WorkspaceMember }) => (
    <View style={[styles.memberCard, { borderColor }]}>
      <View
        style={[
          styles.memberAvatar,
          { backgroundColor: item.cursor?.color || tintColor },
        ]}
      >
        <ThemedText style={styles.memberAvatarText}>
          {item.userName.charAt(0).toUpperCase()}
        </ThemedText>
      </View>
      <View style={styles.memberInfo}>
        <ThemedText type="defaultSemiBold">{item.userName}</ThemedText>
        <ThemedText style={styles.memberRole}>{item.role}</ThemedText>
      </View>
      {item.isOnline && (
        <View style={styles.onlineIndicator} />
      )}
    </View>
  );

  const renderPrompt = ({ item }: { item: CollaborativePrompt }) => (
    <View style={[styles.promptCard, { borderColor }]}>
      <View style={styles.promptHeader}>
        <ThemedText style={styles.promptAuthor}>
          v{item.version} • {item.editedBy}
        </ThemedText>
        <ThemedText style={styles.promptTime}>
          {new Date(item.timestamp).toLocaleTimeString()}
        </ThemedText>
      </View>
      <ThemedText style={styles.promptContent}>{item.content}</ThemedText>
    </View>
  );

  if (!selectedWorkspace) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top, 16),
              paddingBottom: Math.max(insets.bottom + 16, 32),
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()}>
              <ThemedText style={{ fontSize: 28 }}>←</ThemedText>
            </Pressable>
            <ThemedText type="title" style={styles.title}>
              Workspaces
            </ThemedText>
            <Pressable onPress={() => setShowCreateModal(true)}>
              <ThemedText style={{ fontSize: 28 }}>+</ThemedText>
            </Pressable>
          </View>

          {/* Create Workspace Modal */}
          {showCreateModal && (
            <View style={[styles.createModal, { borderColor }]}>
              <ThemedText type="subtitle" style={styles.modalTitle}>
                Create Workspace
              </ThemedText>
              <TextInput
                style={[styles.input, { borderColor, color: textColor, backgroundColor }]}
                placeholder="Workspace name..."
                placeholderTextColor={borderColor}
                value={newWorkspaceName}
                onChangeText={setNewWorkspaceName}
              />
              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.modalButton, { borderColor }]}
                  onPress={() => setShowCreateModal(false)}
                >
                  <ThemedText>Cancel</ThemedText>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, { backgroundColor: tintColor }]}
                  onPress={handleCreateWorkspace}
                >
                  <ThemedText style={{ color: '#000000' }}>Create</ThemedText>
                </Pressable>
              </View>
            </View>
          )}

          {/* Workspaces List */}
          {workspaces.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText type="subtitle">No Workspaces</ThemedText>
              <ThemedText style={styles.emptyText}>
                Create a workspace to start collaborating
              </ThemedText>
            </View>
          ) : (
            <FlatList
              data={workspaces}
              renderItem={renderWorkspaceCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </ScrollView>
      </ThemedView>
    );
  }

  // Workspace Detail View
  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.workspaceHeader2,
          {
            paddingTop: Math.max(insets.top, 16),
            borderBottomColor: borderColor,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => setSelectedWorkspace(null)}>
            <ThemedText style={{ fontSize: 28 }}>←</ThemedText>
          </Pressable>
          <ThemedText type="subtitle" style={styles.workspaceTitle}>
            {selectedWorkspace.name}
          </ThemedText>
          <Pressable onPress={handleShareWorkspace}>
            <ThemedText style={{ fontSize: 24 }}>↗</ThemedText>
          </Pressable>
        </View>
      </View>

      {/* Members List */}
      <View style={[styles.membersSection, { borderBottomColor: borderColor }]}>
        <ThemedText style={styles.sectionTitle}>
          Members ({selectedWorkspace.members.length})
        </ThemedText>
        <FlatList
          horizontal
          data={selectedWorkspace.members}
          renderItem={renderMember}
          keyExtractor={(item) => item.userId}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.membersList}
        />
      </View>

      {/* Prompt History */}
      <FlatList
        data={promptHistory}
        renderItem={renderPrompt}
        keyExtractor={(item) => item.promptId}
        contentContainerStyle={styles.promptsList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>
              No prompts yet. Start collaborating!
            </ThemedText>
          </View>
        }
      />

      {/* Prompt Input */}
      <View
        style={[
          styles.inputContainer,
          {
            paddingBottom: Math.max(insets.bottom, 16),
            borderTopColor: borderColor,
          },
        ]}
      >
        <TextInput
          style={[styles.promptInput, { borderColor, color: textColor, backgroundColor }]}
          placeholder="Type a prompt..."
          placeholderTextColor={borderColor}
          value={currentPrompt}
          onChangeText={setCurrentPrompt}
          multiline
        />
        <Pressable
          style={[
            styles.sendButton,
            { backgroundColor: currentPrompt.trim() ? tintColor : borderColor },
          ]}
          onPress={handleSendPrompt}
          disabled={!currentPrompt.trim()}
        >
          <ThemedText style={{ color: '#000000', fontSize: 20 }}>→</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
  },
  createModal: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  modalTitle: {
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  workspaceCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  workspaceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ownerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ownerBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000000',
  },
  workspaceInfo: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  workspaceInfoText: {
    fontSize: 13,
    opacity: 0.6,
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 8,
  },
  workspaceHeader2: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  workspaceTitle: {
    fontSize: 18,
  },
  membersSection: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.6,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  membersList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    gap: 8,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  memberInfo: {
    gap: 2,
  },
  memberRole: {
    fontSize: 11,
    opacity: 0.6,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginLeft: 4,
  },
  promptsList: {
    padding: 16,
  },
  promptCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  promptAuthor: {
    fontSize: 12,
    opacity: 0.6,
  },
  promptTime: {
    fontSize: 11,
    opacity: 0.5,
  },
  promptContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  promptInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
