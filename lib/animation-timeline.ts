import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Keyframe {
  id: string;
  time: number; // in seconds
  prompt: string;
  transitionType: 'fade' | 'morph' | 'zoom' | 'pan' | 'dissolve';
  transitionDuration: number; // in seconds
}

export interface TimelineProject {
  id: string;
  name: string;
  duration: number; // total duration in seconds
  keyframes: Keyframe[];
  audioUrl?: string;
  audioReactive: boolean;
  fps: 24 | 30 | 60;
  resolution: '720p' | '1080p' | '4K';
  createdAt: number;
  updatedAt: number;
}

export interface AudioAnalysis {
  beats: number[]; // timestamps of detected beats
  tempo: number; // BPM
  energy: number[]; // energy levels over time
}

const TIMELINE_PROJECTS_KEY = 'luxe_timeline_projects';

// Create new timeline project
export async function createTimelineProject(name: string): Promise<TimelineProject> {
  const project: TimelineProject = {
    id: `timeline_${Date.now()}`,
    name,
    duration: 10, // default 10 seconds
    keyframes: [
      {
        id: `keyframe_${Date.now()}_1`,
        time: 0,
        prompt: '',
        transitionType: 'fade',
        transitionDuration: 1,
      },
      {
        id: `keyframe_${Date.now()}_2`,
        time: 10,
        prompt: '',
        transitionType: 'fade',
        transitionDuration: 1,
      },
    ],
    audioReactive: false,
    fps: 30,
    resolution: '1080p',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await saveTimelineProject(project);
  return project;
}

// Get all timeline projects
export async function getTimelineProjects(): Promise<TimelineProject[]> {
  try {
    const data = await AsyncStorage.getItem(TIMELINE_PROJECTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading timeline projects:', error);
    return [];
  }
}

// Get single timeline project
export async function getTimelineProject(id: string): Promise<TimelineProject | null> {
  const projects = await getTimelineProjects();
  return projects.find(p => p.id === id) || null;
}

// Save timeline project
export async function saveTimelineProject(project: TimelineProject): Promise<void> {
  try {
    const projects = await getTimelineProjects();
    const index = projects.findIndex(p => p.id === project.id);
    
    project.updatedAt = Date.now();
    
    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.push(project);
    }
    
    await AsyncStorage.setItem(TIMELINE_PROJECTS_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Error saving timeline project:', error);
  }
}

// Delete timeline project
export async function deleteTimelineProject(id: string): Promise<void> {
  try {
    const projects = await getTimelineProjects();
    const filtered = projects.filter(p => p.id !== id);
    await AsyncStorage.setItem(TIMELINE_PROJECTS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting timeline project:', error);
  }
}

// Add keyframe
export async function addKeyframe(
  projectId: string,
  time: number,
  prompt: string
): Promise<Keyframe> {
  const project = await getTimelineProject(projectId);
  if (!project) throw new Error('Project not found');

  const keyframe: Keyframe = {
    id: `keyframe_${Date.now()}`,
    time,
    prompt,
    transitionType: 'fade',
    transitionDuration: 1,
  };

  project.keyframes.push(keyframe);
  project.keyframes.sort((a, b) => a.time - b.time);
  
  await saveTimelineProject(project);
  return keyframe;
}

// Update keyframe
export async function updateKeyframe(
  projectId: string,
  keyframeId: string,
  updates: Partial<Keyframe>
): Promise<void> {
  const project = await getTimelineProject(projectId);
  if (!project) throw new Error('Project not found');

  const index = project.keyframes.findIndex(k => k.id === keyframeId);
  if (index < 0) throw new Error('Keyframe not found');

  project.keyframes[index] = { ...project.keyframes[index], ...updates };
  project.keyframes.sort((a, b) => a.time - b.time);
  
  await saveTimelineProject(project);
}

// Delete keyframe
export async function deleteKeyframe(projectId: string, keyframeId: string): Promise<void> {
  const project = await getTimelineProject(projectId);
  if (!project) throw new Error('Project not found');

  project.keyframes = project.keyframes.filter(k => k.id !== keyframeId);
  await saveTimelineProject(project);
}

// Generate prompt evolution between keyframes
export function generatePromptEvolution(
  startKeyframe: Keyframe,
  endKeyframe: Keyframe,
  steps: number
): string[] {
  const prompts: string[] = [];
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Simple interpolation - in production, use AI to blend prompts
    if (t < 0.5) {
      prompts.push(`${startKeyframe.prompt}, transitioning to ${endKeyframe.prompt}`);
    } else {
      prompts.push(`${endKeyframe.prompt}, evolved from ${startKeyframe.prompt}`);
    }
  }
  
  return prompts;
}

// Analyze audio for reactive generation
export async function analyzeAudio(audioUrl: string): Promise<AudioAnalysis> {
  // Mock audio analysis - in production, use actual audio processing
  // Could use expo-av or web audio API
  
  const mockBeats: number[] = [];
  for (let i = 0; i < 10; i++) {
    mockBeats.push(i * 0.5); // Beat every 0.5 seconds
  }

  return {
    beats: mockBeats,
    tempo: 120, // 120 BPM
    energy: Array.from({ length: 100 }, (_, i) => Math.sin(i / 10) * 0.5 + 0.5),
  };
}

// Generate keyframes synced to audio beats
export async function generateAudioReactiveKeyframes(
  projectId: string,
  audioUrl: string
): Promise<void> {
  const project = await getTimelineProject(projectId);
  if (!project) throw new Error('Project not found');

  const analysis = await analyzeAudio(audioUrl);
  
  // Clear existing keyframes except first and last
  const firstKeyframe = project.keyframes[0];
  const lastKeyframe = project.keyframes[project.keyframes.length - 1];
  
  project.keyframes = [firstKeyframe];
  
  // Add keyframes at beat positions
  analysis.beats.forEach((beatTime, index) => {
    if (beatTime > 0 && beatTime < project.duration) {
      project.keyframes.push({
        id: `keyframe_beat_${index}`,
        time: beatTime,
        prompt: firstKeyframe.prompt, // Copy from first, user can edit
        transitionType: 'morph',
        transitionDuration: 0.5,
      });
    }
  });
  
  project.keyframes.push(lastKeyframe);
  project.keyframes.sort((a, b) => a.time - b.time);
  project.audioUrl = audioUrl;
  project.audioReactive = true;
  
  await saveTimelineProject(project);
}

// Export timeline to video frames
export async function exportTimelineFrames(
  projectId: string
): Promise<{ frames: string[]; fps: number }> {
  const project = await getTimelineProject(projectId);
  if (!project) throw new Error('Project not found');

  const totalFrames = Math.floor(project.duration * project.fps);
  const frames: string[] = [];

  // Generate prompts for each frame based on keyframe interpolation
  for (let frame = 0; frame < totalFrames; frame++) {
    const time = frame / project.fps;
    
    // Find surrounding keyframes
    let prevKeyframe = project.keyframes[0];
    let nextKeyframe = project.keyframes[project.keyframes.length - 1];
    
    for (let i = 0; i < project.keyframes.length - 1; i++) {
      if (project.keyframes[i].time <= time && project.keyframes[i + 1].time > time) {
        prevKeyframe = project.keyframes[i];
        nextKeyframe = project.keyframes[i + 1];
        break;
      }
    }
    
    // Interpolate prompt
    const t = (time - prevKeyframe.time) / (nextKeyframe.time - prevKeyframe.time);
    const prompt = t < 0.5 ? prevKeyframe.prompt : nextKeyframe.prompt;
    
    frames.push(prompt);
  }

  return { frames, fps: project.fps };
}

// Get timeline preview data
export function getTimelinePreview(project: TimelineProject): {
  segments: Array<{ start: number; end: number; prompt: string; color: string }>;
} {
  const segments: Array<{ start: number; end: number; prompt: string; color: string }> = [];
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];

  for (let i = 0; i < project.keyframes.length - 1; i++) {
    segments.push({
      start: project.keyframes[i].time,
      end: project.keyframes[i + 1].time,
      prompt: project.keyframes[i].prompt,
      color: colors[i % colors.length],
    });
  }

  return { segments };
}
