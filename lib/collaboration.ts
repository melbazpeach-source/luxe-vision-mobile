import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSupabase } from './supabase';

export interface CollaborativeWorkspace {
  id: string;
  name: string;
  ownerId: string;
  members: WorkspaceMember[];
  createdAt: number;
  updatedAt: number;
}

export interface WorkspaceMember {
  userId: string;
  userName: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: number;
  cursor?: {
    x: number;
    y: number;
    color: string;
  };
  isOnline: boolean;
}

export interface CollaborativePrompt {
  workspaceId: string;
  promptId: string;
  content: string;
  editedBy: string;
  version: number;
  timestamp: number;
}

export interface PromptVersion {
  id: string;
  promptId: string;
  content: string;
  author: string;
  timestamp: number;
  generationResult?: string;
}

const WORKSPACES_KEY = 'luxe_workspaces';
const MEMBER_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#FFA07A',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E2',
];

// Get random color for new member
function getRandomColor(): string {
  return MEMBER_COLORS[Math.floor(Math.random() * MEMBER_COLORS.length)];
}

// Create new workspace
export async function createWorkspace(
  ownerId: string,
  ownerName: string,
  name: string
): Promise<CollaborativeWorkspace> {
  const workspace: CollaborativeWorkspace = {
    id: `workspace_${Date.now()}`,
    name,
    ownerId,
    members: [
      {
        userId: ownerId,
        userName: ownerName,
        role: 'owner',
        joinedAt: Date.now(),
        isOnline: true,
        cursor: { x: 0, y: 0, color: getRandomColor() },
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // Save to local storage
  await saveWorkspace(workspace);

  // TODO: Save to Supabase when online
  try {
    const supabase = getSupabase();
    if (!supabase) return workspace;
    const { error } = await supabase.from('workspaces').insert({
      id: workspace.id,
      name: workspace.name,
      owner_id: parseInt(ownerId),
      created_at: new Date(workspace.createdAt).toISOString(),
      updated_at: new Date(workspace.updatedAt).toISOString(),
    });

    if (error) console.error('Supabase workspace creation error:', error);
  } catch (error) {
    console.log('Offline mode: workspace saved locally');
  }

  return workspace;
}

// Save workspace to local storage
async function saveWorkspace(workspace: CollaborativeWorkspace): Promise<void> {
  try {
    const workspaces = await getLocalWorkspaces();
    const index = workspaces.findIndex(w => w.id === workspace.id);
    
    if (index >= 0) {
      workspaces[index] = workspace;
    } else {
      workspaces.push(workspace);
    }

    await AsyncStorage.setItem(WORKSPACES_KEY, JSON.stringify(workspaces));
  } catch (error) {
    console.error('Error saving workspace:', error);
  }
}

// Get local workspaces
async function getLocalWorkspaces(): Promise<CollaborativeWorkspace[]> {
  try {
    const data = await AsyncStorage.getItem(WORKSPACES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading workspaces:', error);
    return [];
  }
}

// Get user's workspaces
export async function getUserWorkspaces(userId: string): Promise<CollaborativeWorkspace[]> {
  const workspaces = await getLocalWorkspaces();
  return workspaces.filter(
    w => w.ownerId === userId || w.members.some(m => m.userId === userId)
  );
}

// Join workspace
export async function joinWorkspace(
  workspaceId: string,
  userId: string,
  userName: string
): Promise<CollaborativeWorkspace | null> {
  const workspaces = await getLocalWorkspaces();
  const workspace = workspaces.find(w => w.id === workspaceId);

  if (!workspace) return null;

  // Check if already a member
  if (workspace.members.some(m => m.userId === userId)) {
    // Update online status
    workspace.members = workspace.members.map(m =>
      m.userId === userId ? { ...m, isOnline: true } : m
    );
  } else {
    // Add new member
    workspace.members.push({
      userId,
      userName,
      role: 'editor',
      joinedAt: Date.now(),
      isOnline: true,
      cursor: { x: 0, y: 0, color: getRandomColor() },
    });
  }

  workspace.updatedAt = Date.now();
  await saveWorkspace(workspace);

  return workspace;
}

// Leave workspace
export async function leaveWorkspace(
  workspaceId: string,
  userId: string
): Promise<void> {
  const workspaces = await getLocalWorkspaces();
  const workspace = workspaces.find(w => w.id === workspaceId);

  if (!workspace) return;

  workspace.members = workspace.members.map(m =>
    m.userId === userId ? { ...m, isOnline: false } : m
  );

  workspace.updatedAt = Date.now();
  await saveWorkspace(workspace);
}

// Update cursor position
export async function updateCursorPosition(
  workspaceId: string,
  userId: string,
  x: number,
  y: number
): Promise<void> {
  const workspaces = await getLocalWorkspaces();
  const workspace = workspaces.find(w => w.id === workspaceId);

  if (!workspace) return;

  workspace.members = workspace.members.map(m =>
    m.userId === userId && m.cursor
      ? { ...m, cursor: { ...m.cursor, x, y } }
      : m
  );

  // Don't save to storage for cursor updates (too frequent)
  // Instead, broadcast via Supabase Realtime
  try {
    const supabase = getSupabase();
    if (!supabase) return;
    const channel = supabase.channel(`workspace:${workspaceId}`);
    channel.send({
      type: 'broadcast',
      event: 'cursor_move',
      payload: { userId, x, y },
    });
  } catch (error) {
    console.log('Offline mode: cursor update skipped');
  }
}

// Create collaborative prompt
export async function createCollaborativePrompt(
  workspaceId: string,
  content: string,
  authorId: string
): Promise<CollaborativePrompt> {
  const prompt: CollaborativePrompt = {
    workspaceId,
    promptId: `prompt_${Date.now()}`,
    content,
    editedBy: authorId,
    version: 1,
    timestamp: Date.now(),
  };

  // Broadcast to workspace
  try {
    const supabase = getSupabase();
    if (!supabase) return prompt;
    const channel = supabase.channel(`workspace:${workspaceId}`);
    channel.send({
      type: 'broadcast',
      event: 'prompt_update',
      payload: prompt,
    });
  } catch (error) {
    console.log('Offline mode: prompt saved locally');
  }

  return prompt;
}

// Update collaborative prompt
export async function updateCollaborativePrompt(
  prompt: CollaborativePrompt,
  newContent: string,
  editorId: string
): Promise<CollaborativePrompt> {
  const updated: CollaborativePrompt = {
    ...prompt,
    content: newContent,
    editedBy: editorId,
    version: prompt.version + 1,
    timestamp: Date.now(),
  };

  // Broadcast to workspace
  try {
    const supabase = getSupabase();
    if (!supabase) return updated;
    const channel = supabase.channel(`workspace:${prompt.workspaceId}`);
    channel.send({
      type: 'broadcast',
      event: 'prompt_update',
      payload: updated,
    });
  } catch (error) {
    console.log('Offline mode: prompt update saved locally');
  }

  return updated;
}

// Subscribe to workspace updates
export function subscribeToWorkspace(
  workspaceId: string,
  callbacks: {
    onMemberJoin?: (member: WorkspaceMember) => void;
    onMemberLeave?: (userId: string) => void;
    onCursorMove?: (userId: string, x: number, y: number) => void;
    onPromptUpdate?: (prompt: CollaborativePrompt) => void;
  }
) {
  const supabase = getSupabase();
  if (!supabase) {
    return () => {};
  }
  const channel = supabase.channel(`workspace:${workspaceId}`);

  channel
    .on('presence', { event: 'join' }, ({ key, newPresences }: any) => {
      if (callbacks.onMemberJoin && newPresences[0]) {
        callbacks.onMemberJoin(newPresences[0] as WorkspaceMember);
      }
    })
    .on('presence', { event: 'leave' }, ({ key }: any) => {
      if (callbacks.onMemberLeave) {
        callbacks.onMemberLeave(key);
      }
    })
    .on('broadcast', { event: 'cursor_move' }, ({ payload }: any) => {
      if (callbacks.onCursorMove) {
        callbacks.onCursorMove(payload.userId, payload.x, payload.y);
      }
    })
    .on('broadcast', { event: 'prompt_update' }, ({ payload }: any) => {
      if (callbacks.onPromptUpdate) {
        callbacks.onPromptUpdate(payload as CollaborativePrompt);
      }
    })
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
}

// Generate shareable invite link
export function generateInviteLink(workspaceId: string): string {
  // In production, this would be a deep link
  return `luxe://workspace/join/${workspaceId}`;
}

// Parse invite link
export function parseInviteLink(link: string): string | null {
  const match = link.match(/workspace\/join\/(.+)$/);
  return match ? match[1] : null;
}
