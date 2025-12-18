# Luxe Vision Creator - Mobile App Design

## Design Philosophy

Luxe Vision Creator is a **premium AI creative suite** for mobile, targeting professional creators and enthusiasts who demand high-fidelity image generation, cinematic video production, and post-production grading on-the-go. The design must feel **sophisticated, powerful, and intuitive** — like a professional creative tool, not a toy.

## Visual Style

**Palette:**
- Primary: Platinum (#E5E4E2) - Luxe brand color
- Accent: Deep Black (#000000) - Ink color for contrast
- Background: Pure White (#FFFFFF) for light mode, Deep Charcoal (#151718) for dark mode
- Text Hierarchy: Primary (#11181C), Secondary (#687076), Disabled (#9BA1A6)
- Surface: Card (#F8F8F8 light / #1F1F1F dark), Elevated (#FFFFFF light / #252525 dark)

**Typography:**
- Title: 32pt, Bold, Line Height 40pt
- Subtitle: 20pt, Bold, Line Height 28pt
- Body: 16pt, Regular, Line Height 24pt
- Caption: 12pt, Regular, Line Height 16pt

**Spacing:** 8pt grid system (8, 12, 16, 24, 32, 40, 48)

**Corner Radius:**
- Buttons: 12pt
- Cards: 16pt
- Modals/Sheets: 24pt

**Icons:** All filled style, 24-28pt for tab bar, 20-24pt for buttons

## Screen List

### 1. Landing Screen
- **Purpose:** First impression, brand introduction, call-to-action
- **Content:** Hero headline, subheadline, feature highlights (Nano Banana Pro, Veo Cinematic Video, Post-Production), CTA button
- **Functionality:** Navigate to Auth or Studio (if beta code available)

### 2. Authentication Screen
- **Purpose:** User login/signup with beta code validation
- **Content:** Email/password fields, beta code input, social login options
- **Functionality:** Validate beta code, authenticate user, sync to database

### 3. Studio Screen (Main Creative Hub)
- **Purpose:** Primary workspace for AI generation
- **Content:** 
  - Mode selector (Image, Video, Animation, Analysis, Speech)
  - Prompt input with attachment support
  - Generation controls (size, aspect ratio, model selection)
  - Real-time preview area
  - Generation history carousel
- **Functionality:** Generate images/videos, manage settings, view history

### 4. Dashboard Screen
- **Purpose:** User profile, subscription management, creation gallery
- **Content:**
  - User profile card (avatar, name, subscription tier)
  - Credit balance display
  - Creation gallery grid (filterable by type)
  - Subscription upgrade CTA
- **Functionality:** View all creations, manage subscription, access settings

### 5. Admin Screen (Super Admin Only)
- **Purpose:** Platform management and analytics
- **Content:**
  - User management table
  - Ad management (impressions, clicks, revenue)
  - Global settings (API keys, integrations, branding)
  - Landing page content editor
  - Affiliate management
- **Functionality:** CRUD operations for users, ads, settings

### 6. Muse AI Assistant Screen
- **Purpose:** AI Creative Director for guidance and suggestions
- **Content:**
  - Chat interface with Muse
  - Contextual suggestions based on user's work
  - Quick actions (refine prompt, suggest variations, analyze image)
- **Functionality:** Natural language interaction, agentic actions

### 7. Post-Production Screen
- **Purpose:** Edit and enhance generated content
- **Content:**
  - Image/video preview
  - Filter library (Luxe Filters)
  - Audio mixer (background music, AI voiceovers)
  - Caption generator
  - Export options
- **Functionality:** Apply filters, add audio, generate captions, export

### 8. Pricing Modal
- **Purpose:** Display subscription plans and upgrade flow
- **Content:**
  - Plan cards (Free, Paid, Reseller)
  - Feature comparison
  - Monthly/Annual toggle
  - Stripe payment integration
- **Functionality:** Select plan, process payment, upgrade subscription

### 9. Settings Screen
- **Purpose:** User preferences and account management
- **Content:**
  - Profile settings (name, email, avatar)
  - API key management (Google, OpenAI, Anthropic, XAI, DeepSeek, OpenRouter)
  - Theme toggle (light/dark)
  - Notification preferences
  - Logout button
- **Functionality:** Update profile, manage API keys, toggle settings

## Key User Flows

### Flow 1: First-Time User Onboarding
1. User opens app → Landing Screen
2. Taps "Launch Studio" → Auth Screen (beta code required)
3. Enters beta code + email/password → Validates → Studio Screen
4. Sees welcome modal with quick tour
5. Starts first generation

### Flow 2: Generate Image
1. User on Studio Screen
2. Selects "Image" mode
3. Types prompt (e.g., "A futuristic cityscape at sunset")
4. Adjusts settings (size: 4K, aspect ratio: 16:9, model: Gemini 3 Pro)
5. Taps "Generate" button
6. Loading state with progress indicator
7. Image appears in preview area
8. User can save to gallery, share, or edit in Post-Production

### Flow 3: Generate Video
1. User on Studio Screen
2. Selects "Video" mode
3. Uploads reference image OR types prompt
4. Adjusts settings (resolution: 1080p, duration: 10s, model: Veo 3.1)
5. Taps "Generate" button
6. Loading state (longer than image)
7. Video preview with playback controls
8. User can save, share, or edit

### Flow 4: Post-Production Editing
1. User on Dashboard Screen
2. Taps on a creation from gallery
3. Opens in Post-Production Screen
4. Applies Luxe Filter (e.g., "Cinematic Teal & Orange")
5. Adds background music from library
6. Generates AI captions
7. Taps "Export" → Saves to device or shares

### Flow 5: Subscription Upgrade
1. User on Dashboard Screen
2. Sees "Upgrade to Pro" CTA
3. Taps → Pricing Modal opens
4. Selects "Paid" plan (Monthly $29)
5. Taps "Subscribe" → Stripe checkout
6. Completes payment → Subscription updated
7. Returns to Dashboard with new credit balance

### Flow 6: Admin Management
1. Super Admin logs in
2. Navigates to Admin Screen
3. Views user list, filters by subscription tier
4. Edits a user's role or permissions
5. Navigates to Ad Management
6. Creates new ad (uploads image, sets placement, link)
7. Saves → Ad goes live on platform

### Flow 7: Muse AI Interaction
1. User on Studio Screen, stuck on prompt
2. Taps "Ask Muse" button
3. Muse modal opens with chat interface
4. User types "Suggest a prompt for a luxury car ad"
5. Muse responds with 3 prompt variations
6. User selects one → Auto-fills prompt field
7. User generates image with suggested prompt

## Color Choices

- **Primary Brand Color:** Platinum (#E5E4E2) - Represents luxury, sophistication, and premium quality
- **Ink Color:** Deep Black (#000000) - High contrast for readability and professional feel
- **Accent for CTAs:** Electric Blue (#007AFF) - iOS native feel for primary actions
- **Success:** Emerald Green (#34C759) - For successful generations and confirmations
- **Warning:** Amber (#FF9500) - For low credit warnings
- **Error:** Crimson Red (#FF3B30) - For failed generations or validation errors

## Navigation Structure

**Bottom Tab Bar (4 tabs):**
1. **Studio** (house.fill icon) - Main creative workspace
2. **Gallery** (photo.fill icon) - Dashboard with creation gallery
3. **Muse** (sparkles.fill icon) - AI Creative Director
4. **Profile** (person.fill icon) - Settings and account management

**Modal Screens:**
- Pricing Modal (triggered from Dashboard upgrade CTA)
- Post-Production Editor (triggered from Gallery tap)
- Admin Panel (accessible only for super admin role)

## Data Architecture

**Local Storage (AsyncStorage):**
- User preferences (theme, notification settings)
- Recent prompts (for quick access)
- Draft creations (not yet saved to cloud)

**Supabase Database:**
- User profiles (id, email, name, subscription tier, role, permissions, API keys)
- Creations (id, user_id, type, url, thumbnail_url, prompt, timestamp, settings)
- Advertisements (id, client_name, image_url, placement, impressions, clicks, revenue)
- Global Settings (app_name, brand_color, stripe keys, integration keys)
- Waitlist (email, timestamp)
- Beta Invites (code, max_uses, used_count, created_at)

**Fallback Strategy:**
- All critical data (user profile, creations) saved to Local Storage first
- Synced to Supabase when connection available
- If Supabase unavailable, app continues to function with local data
- Background sync when connection restored

## Technical Considerations

- **One-Handed Usage:** All primary actions (generate button, tab bar) in bottom 1/3 of screen
- **Touch Targets:** Minimum 44pt for all interactive elements
- **Safe Area Handling:** Use `useSafeAreaInsets()` for all screens to respect notches and home indicators
- **Performance:** Use FlatList for creation gallery, memoize heavy components
- **Animations:** Smooth transitions with react-native-reanimated for modal presentations and loading states
- **Haptic Feedback:** Light haptic on button taps, success haptic on generation complete
- **Dark Mode:** Full support with themed colors and images
