# Gather.town Clone Strategy for Learning Adventures Platform

## Executive Summary

Gather.town is a **spatial virtual workspace** where users navigate 2D avatars on a campus-like map and automatically activate proximity-based audio/video when close to others. This document outlines the architecture, asset pipeline, and tech stack needed to build a functional Learning Adventures demo inspired by Gather's design and aesthetic.

**Core Insight**: Gather succeeds because spatial navigation (moving your avatar) is more intuitive and discovery-oriented than grid-based video call interfaces. A 16-bit pixel-art campus creates a playful, low-pressure social space ideal for educational interactions.

---

## Part 1: Product & Design

### 1.1 Core Mechanics (What Makes Gather Gather)

**Spatial Proximity System**
- Users control 2D avatars that move through a shared campus map
- Audio/video connections **activate automatically** when avatars are close (typically within a ~200px radius)
- Distance affects audio clarity — closer = clearer, farther = muffled or silent
- No need for links, invites, or explicit "start call" — social interactions feel organic

**Why This Matters for Learning Adventures**
- Students can explore a virtual campus (math building, science lab, history wing, etc.)
- Teachers/helpers positioned in specific rooms are "available" when students enter
- Spontaneous peer learning happens naturally when students bump into each other
- Eliminates Zoom fatigue of always being on camera in a grid

### 1.2 Visual Aesthetic: 16-Bit Retro Pixel Art

**Gather's Style**
- Top-down isometric or orthogonal perspective
- 32x32 pixel tile grid (standard NES/SNES era)
- Character avatars typically 16x32 pixels (sprite height)
- Rich, colorful tileset (indoor/outdoor, fantasy/sci-fi/modern themes)
- Nostalgic but accessible — appeals to players aged 8–80

**Learning Adventures Adaptation**
- Create a "campus" tileset with:
  - **Outdoor areas**: main quad, courtyard, pathway network
  - **Thematic buildings**: Math Tower, Science Lab, English Library, History Museum, Innovation Hub
  - **Social spaces**: cafeteria, lounge, garden, sports field
  - **Interactive objects**: desks, whiteboards, books, experiments (non-walkable overlays)

**Asset Requirements**
- **Tilesets**: 32x32 pixel base tiles for floors, walls, terrain, decorations
- **Character sprites**: 16x32 pixels (or 32x32 for standing) with 4–8 directional frames + idle/walk animations
- **Objects/NPCs**: 32x32–64x64 pixel overlays (trees, benches, whiteboards, teacher avatars)
- **UI**: pixel-art menus, name tags, status indicators

---

## Part 2: Technical Architecture

### 2.1 High-Level Stack

```
Frontend (Browser)
├── Canvas/WebGL Rendering: Phaser 3 (2D game framework)
├── Avatar Movement & Input: Keyboard / Touch controls
├── Real-time State Sync: WebSocket client
├── Proximity Audio/Video: WebRTC (peer-to-peer or SFU)
└── UI: HTML/CSS overlay (names, chat, controls)

Backend (Node.js)
├── WebSocket Server: Manages avatar positions, room state
├── Room/Session Manager: Colyseus (real-time state sync)
├── Proximity Engine: Calculates distance, triggers audio/video
├── Video Signaling: WebRTC SDP/ICE exchange (or external STUN/TURN)
└── Database: Prisma + PostgreSQL (user sessions, map state)

Asset Pipeline
├── Tiled Map Editor (author .tmx files)
├── Sprite/Tileset Creation (Aseprite, Piskel, or free tools)
├── Asset Export: PNG tilesets + JSON metadata
└── Integration: Load into Phaser at runtime
```

### 2.2 Core Subsystems

#### 2.2.1 Multiplayer State Synchronization (Colyseus Pattern)

**Why Colyseus?**
- Built for spatial games (rooms = game instances)
- Automatic delta-compression (only sends state changes)
- Handles interpolation of smooth avatar movement
- Plugs directly into Phaser with a simple API

**Data Model**
```typescript
// Server-side room state
class CampusRoom {
  players: {
    [sessionId]: {
      id: string
      username: string
      avatarId: number
      x: number
      y: number
      direction: 'up' | 'down' | 'left' | 'right'
      isMoving: boolean
      joinedAt: number
    }
  }
  objects: {
    [objectId]: {
      type: 'whiteboard' | 'book' | 'experiment'
      x: number
      y: number
      data: any // content, state
    }
  }
}
```

**Client-side Update Loop**
1. Player presses arrow key → emit `PlayerMove` to server
2. Server validates movement against collision map, updates state
3. State change broadcasts to all players in room
4. Phaser client interpolates avatar position smoothly (not teleport)
5. Every 100ms, proximity calculation triggers or drops audio connections

#### 2.2.2 Proximity Audio/Video Engine

**Architecture Decision: Mesh vs. SFU**
- **Mesh (P2P)**: Works for 4–6 users, high quality, no server overhead
  - Use: Small classroom scenarios (1 teacher + 5 students)
  - Library: `simple-peer` (WebRTC wrapper) + WebSocket signaling
- **SFU (Selective Forwarding Unit)**: Scales to 100+ users, lower per-user latency
  - Use: Campus-wide gatherings, multi-room interactions
  - Options: Jitsi, MediaSoup, or Open Streaming Platform (OSP)

**Proximity Logic**
```javascript
// On every state update:
const distance = Math.hypot(
  otherPlayer.x - myPlayer.x,
  otherPlayer.y - myPlayer.y
)

if (distance < PROXIMITY_THRESHOLD) {
  // Activate audio/video with this player
  if (!activeCall[otherPlayer.id]) {
    initiateP2PConnection(otherPlayer.id)
  }
} else {
  // Drop audio/video
  if (activeCall[otherPlayer.id]) {
    hangUp(otherPlayer.id)
  }
}
```

**Audio Spatialization** (Optional, Advanced)
- Render avatar's voice from the direction they're positioned
- Left speaker = user to the left, right speaker = user to the right
- Creates immersive "cocktail party" effect without separate video windows

#### 2.2.3 Avatar Movement & Collision

**Grid-Based vs. Smooth Movement**
- **Tile-grid**: Avatar snaps to 32x32 cells (simpler, classic RPG feel)
- **Free-form**: Avatar moves pixel-by-pixel with WASD or joystick (more modern, responsive)

**Recommendation**: Start with tile-based for simplicity, add smooth interpolation on the client for visual fluidity.

**Collision Detection**
- Tiled exports collision data as an object layer (tile-by-tile walkability)
- Phaser physics engine checks collisions before moving avatar
- NPCs/teachers can be placed as non-walkable objects

#### 2.2.4 Map & Tilemap System

**Why Tiled Map Editor?**
- Industry-standard, free, open-source
- Exports to JSON (easy to parse in JavaScript)
- Supports multiple layers (ground, objects, collision, visual effects)
- Large community + tons of free/paid tilesets
- Extensible with custom properties (e.g., "this room is Math 101")

**Map Structure**
```
Campus Map (Tiled .tmx → JSON)
├── Layer 1: Ground tiles (floors, grass, water)
├── Layer 2: Object layer (trees, buildings, whiteboards)
├── Layer 3: Collision layer (walkable/non-walkable)
├── Custom Properties:
│   ├── Room metadata: name, subject, capacity
│   ├── Spawn points: where players enter
│   └── Interactive zones: "click to open whiteboard"
└── Exported to: campus.json (loaded at runtime)
```

**Phaser Integration**
```javascript
// Load tilemap
const map = this.make.tilemap({ key: 'campus' })
const tileset = map.addTilesetImage('tilesetName', 'tilesImage')
const groundLayer = map.createLayer('ground', tileset)
const collisionLayer = map.getLayer('collision')

// Set collision from Tiled data
collisionLayer.setCollision(/* tile IDs that are solid */)
this.physics.add.collider(player, collisionLayer)
```

---

## Part 3: Asset Design & Pipeline

### 3.1 Sprite & Tileset Standards

**Grid Size**: 32x32 pixels (Gather standard)
- All environment tiles: 32×32
- Character sprites: typically 16×32 (half-width of tiles, full height)
- Objects: 32×32, 64×64, or multiples of 32

**Palette & Aesthetics**
- Limited color palette (16–256 colors) to maintain retro feel
- Common themes:
  - **Fantasy RPG**: Medieval buildings, nature, magic
  - **Modern Campus**: Contemporary architecture, plants, benches
  - **Sci-Fi**: Futuristic buildings, neon accents, tech objects
  - **Mixed Educational**: Blend of themes per room (Math = geometry visuals, Science = lab benches, etc.)

**Animation Standards**
- **Character walk cycle**: 4 frames per direction × 4 directions = 16 frames minimum
- **Idle animation**: 2–3 frames (subtle bobbing or breathing)
- **NPC animations**: Loop-based (teacher at desk, scientist at workbench)
- Frame duration: 100–150ms per frame (6–10 FPS for retro feel)

### 3.2 Asset Creation Workflow

**Option A: Use Existing Free Assets**
1. **Itch.io Collections**
   - Gather.town-compatible tilesets: https://itch.io/c/1904339/gathertown-compatible-32x32-tilesets
   - Character sprites: https://itch.io/c/1904363/gathertown-compatible-environment-and-item-sprites
   - Free sprite packs: "LPC sprites" (Liberated Pixel Cup project)

2. **OpenGameArt**
   - Community-curated free tilesets and sprites
   - LPC-compatible assets (modular, customizable)

**Option B: Create Custom Assets**
1. **Tools**
   - **Tiled Map Editor**: Free, cross-platform (author maps)
   - **Aseprite**: Paid sprite editor (professional grade)
   - **Piskel**: Free, browser-based sprite animator
   - **LibreSprite**: Free fork of Aseprite
   - **Pyxel Edit**: Affordable, focused on pixel art

2. **Workflow**
   - Design tileset grid in Aseprite or Pyxel Edit (32×32 blocks)
   - Create character sprite template (pick a base, customize colors/features)
   - Animate walk cycles and idle states
   - Export PNG tileset + JSON metadata
   - Import into Tiled, build campus layout
   - Export Tiled map as JSON

**Option C: AI-Generated + Manual Refinement** (Not Recommended)
- Generative tools can create initial sprites, but pixel-art quality requires hand-tuning
- Better to start with community assets + minimal custom tweaks

### 3.3 Asset Organization

```
learning-adventures-platform/
├── public/
│   ├── assets/
│   │   ├── tilesets/
│   │   │   ├── campus.png (all tiles in one image)
│   │   │   ├── campus_metadata.json (tile properties)
│   │   │   └── themes/
│   │   │       ├── math_theme.png
│   │   │       ├── science_theme.png
│   │   │       └── history_theme.png
│   │   ├── sprites/
│   │   │   ├── player_avatars.png (multiple character skins)
│   │   │   ├── npcs.png (teacher, librarian, etc.)
│   │   │   └── animations.json (frame definitions)
│   │   ├── maps/
│   │   │   ├── campus.json (Tiled export)
│   │   │   ├── math_building.json
│   │   │   ├── science_lab.json
│   │   │   └── history_museum.json
│   │   └── audio/
│   │       ├── ambient_sounds.mp3
│   │       └── ui_sfx.mp3
│   └── scenes/ (Phaser scene files)
│       ├── CampusScene.js
│       └── RoomScene.js
└── components/
    └── spatial-world/
        ├── SpatialWorldComponent.tsx
        ├── useProximityAudio.ts
        ├── useAvatarMovement.ts
        └── networkedClient.ts
```

---

## Part 4: Implementation Roadmap

### Phase 1: Foundation (2–3 weeks)
1. **Setup Phaser + Colyseus Project**
   - Initialize Node.js server + Phaser 3 client
   - Create basic WebSocket server with Colyseus

2. **Build Simple Campus Map**
   - Author 1 small map in Tiled (e.g., 50×50 tiles, ~1600×1600 pixels)
   - Load into Phaser, render with placeholder assets
   - Implement avatar movement (tile-based + smooth interpolation)

3. **Test Multiplayer Sync**
   - 2+ players in same room
   - Avatar positions sync across clients
   - Collision detection working

### Phase 2: Audio/Video (2–3 weeks)
1. **Integrate WebRTC**
   - Add `simple-peer` library for P2P audio/video
   - WebSocket signaling server for SDP/ICE exchange

2. **Implement Proximity Logic**
   - Calculate distances every 100ms
   - Trigger/drop audio when players enter/exit range

3. **Test with 2–6 Concurrent Users**
   - Verify audio activates correctly
   - Smooth audio transitions (fade in/out)

### Phase 3: Assets & Polish (2–3 weeks)
1. **Acquire/Create Sprites & Tilesets**
   - Download community assets or create custom
   - Integrate into Phaser scenes

2. **Expand Campus Map**
   - 4–5 buildings (Math, Science, English, History, Innovation)
   - Multiple rooms per building
   - Interactive objects (whiteboards, desks, etc.)

3. **Avatar Customization**
   - Pick from 5–10 character skins
   - Simple skin picker in lobby

### Phase 4: Educational Features (2 weeks)
1. **Integrate with Learning Adventures**
   - Link campus rooms to actual courses/lessons
   - Place teachers/mentors as NPCs in specific rooms
   - Track which rooms students have visited (for progress)

2. **Interactive Content**
   - Whiteboard or quiz object that opens a lesson modal
   - "Book" objects that link to content
   - Experiment stations that run interactive demos

3. **Persistence**
   - Save student progress (visited rooms, time spent, connections made)
   - Leaderboard or achievement badges for exploration

---

## Part 5: Tech Stack Decisions

### Frontend
| Component | Recommendation | Alternative |
|-----------|-----------------|-------------|
| **Rendering** | Phaser 3 (2D game framework) | Babylon.js, Three.js (overkill for 2D) |
| **Multiplayer Sync** | Colyseus (rooms + state) | Firebase Realtime, Socket.io |
| **WebRTC** | simple-peer (wrapped) | Agora SDK, Jitsi |
| **Map Editor** | Tiled (JSON export) | Godot, Stride (heavyweight) |
| **Sprite Editing** | Aseprite (paid) or LibreSprite (free) | Photoshop, Piskel |

### Backend
| Component | Recommendation | Notes |
|-----------|-----------------|-------|
| **Server Framework** | Node.js + Express | Lightweight, JavaScript |
| **Multiplayer** | Colyseus | Handles room management, state sync |
| **Database** | PostgreSQL (already in project) | Use existing setup |
| **ORM** | Prisma (already in project) | Sessions, user progress |
| **Video Signaling** | WebSocket (built into Colyseus) | No separate TURN needed initially |
| **Hosting** | Vercel (frontend) + Railway/Render (backend) | Scalable, cost-effective |

### DevOps
- **GitHub Actions**: Deploy frontend to Vercel on push
- **Dockerfile**: Containerize Colyseus server for Railway or Render
- **Environment**: Use existing `.env` setup for API keys, DB connections

---

## Part 6: Open-Source Reference Implementations

### 1. **Colyseus + Phaser Tutorial**
- **Source**: https://github.com/colyseus/tutorial-phaser
- **What It Shows**: 
  - Real-time multiplayer room with Phaser rendering
  - Avatar synchronization, basic movement
  - Closest to Learning Adventures needs
- **Adaptability**: High — already Phaser + Colyseus stack

### 2. **Gather.town TypeScript Clone**
- **Source**: https://github.com/eweren/gather.town
- **What It Shows**:
  - Actual Gather clone structure
  - Jitsi integration for video
  - Electron desktop wrapper
- **Adaptability**: Medium — uses Jitsi (heavy), demo no longer runs (servers shut down)
- **Learning Value**: See how Gather architecture maps to code

### 3. **Simple WebRTC P2P Clone**
- **Source**: https://github.com/pillowinacoma/p2p-webRTC-gathertown
- **What It Shows**:
  - Minimal WebRTC setup (simple-peer)
  - WebSocket signaling for avatar sync
  - React frontend
- **Adaptability**: Medium — not game-engine-based, but networking is clear

### 4. **Gathering Code (Unofficial Community Reverse-Engineering)**
- **Source**: https://github.com/Markkop/gather-town-websocket-examples
- **What It Shows**:
  - Protocol Buffer message formats used by Gather
  - WebSocket event schemas (MapSetObjects, PlayerMove, etc.)
- **Learning Value**: High — shows real message structure
- **Caveat**: Reverse-engineered, may change

---

## Part 7: Critical Decisions & Trade-offs

### Decision 1: Tile-Grid vs. Free-Form Movement
| Aspect | Tile-Grid | Free-Form |
|--------|-----------|-----------|
| **Complexity** | Simpler | More complex (physics interpolation) |
| **Retro Feel** | Strong | Weaker |
| **Responsiveness** | Slightly delayed (wait for tile transition) | Immediate |
| **Recommendation** | ✅ For MVP | Later iteration |

### Decision 2: Mesh (P2P) vs. SFU Video
| Aspect | Mesh | SFU |
|--------|------|-----|
| **Scalability** | 4–6 users max | 100+ users |
| **Latency** | Low (direct P2P) | Slightly higher (server hop) |
| **Server Cost** | Minimal | Significant |
| **Setup Complexity** | Simple (simple-peer + WebSocket) | Complex (Jitsi / MediaSoup) |
| **Recommendation** | ✅ MVP (small classrooms) | Scale phase (campus-wide) |

### Decision 3: Asset Sourcing
| Option | Pros | Cons |
|--------|------|------|
| **Free community assets** | No cost, immediate | May lack cohesion, limited customization |
| **Custom-created** | Perfect fit, unique brand | Time-intensive, artist required |
| **AI-generated + refinement** | Fast iteration | Quality inconsistent, hand-tuning needed |
| **Recommendation** | ✅ Mix: Start with community, layer custom | Balanced approach |

### Decision 4: Single Map vs. Multiple Rooms
| Approach | Pros | Cons |
|----------|------|------|
| **Single large map** | Seamless exploration, feels cohesive | Can feel cramped, harder to manage |
| **Multiple rooms (loading screens)** | Organized, room-specific features | Friction (loading), less organic |
| **Hybrid (linked seamless areas)** | Balanced | More complex to implement |
| **Recommendation** | ✅ Hybrid: 4–5 buildings on main campus, interiors via transitions | Best for education + exploration |

---

## Part 8: Effort & Resource Estimates

### Developer Time
- **Backend (Colyseus server)**: 1–2 weeks
- **Frontend (Phaser + avatar sync)**: 2–3 weeks
- **Audio/Video integration**: 1–2 weeks
- **Map design & asset integration**: 1–2 weeks
- **Testing & polish**: 1 week
- **Total**: ~8–10 weeks (1 full-time developer)

### Asset Production
- **If using free community assets**: 1–2 days (download, verify, integrate)
- **If creating custom**:
  - Tileset (32×32 grid, ~64–128 unique tiles): 3–5 days
  - Character sprites (4 skins, walk cycles): 2–3 days
  - NPC/object sprites: 1–2 days
  - Map design (5 buildings): 2–3 days
  - **Total custom**: ~10–15 days

### Infrastructure
- **Development**: Free (local Colyseus, SQLite for testing)
- **Staging**: ~$20/month (Railway or Render for backend)
- **Production**: ~$50–200/month (depends on concurrent users)

---

## Part 9: Success Metrics

### MVP Success Criteria
- [ ] 2+ users can move avatars smoothly in shared campus
- [ ] Avatars sync correctly (no ghosting or lag)
- [ ] Proximity-based audio activates/deactivates within 500ms
- [ ] Campus map with 3+ rooms, collision working
- [ ] One educational integration (e.g., link room to a lesson)
- [ ] Load test: 10 concurrent users stable

### Post-MVP Enhancements
- [ ] Smooth avatar animation (walk cycles, idle)
- [ ] Whiteboard/screen-sharing object
- [ ] Teacher "office hours" room with bookable time slots
- [ ] Student progress tracking per campus areas
- [ ] Multi-building campus (100+ rooms)
- [ ] Leaderboard (most active students, rooms explored, time spent)
- [ ] Mobile responsive (touch-based avatar movement)

---

## Part 10: Integration with Learning Adventures Platform

### Current Platform State
- ✅ NextAuth.js authentication
- ✅ User roles (Student, Teacher, Parent, Admin)
- ✅ PostgreSQL database with Prisma ORM
- ✅ Progress tracking system
- ✅ Achievement/badge system

### Integration Points

**1. User Sessions**
```typescript
// On "enter campus" button click
const user = session.user // From NextAuth
const campusRoom = await getCampusRoom(user.id)
// Open Phaser scene, pass user data to Colyseus
```

**2. Progress Tracking**
```typescript
// When student visits a new campus building
await updateUserProgress({
  userId: user.id,
  event: 'visited_building',
  buildingId: 'math_tower',
  timestamp: new Date(),
  durationSeconds: 300
})

// Award badge when visiting all buildings
if (buildingsVisited.length === TOTAL_BUILDINGS) {
  await awardBadge(user.id, 'campus_explorer')
}
```

**3. Room-to-Course Linking**
```typescript
// Math building room links to Algebra course
const courseContent = await getCourseByRoom('math_tower')
// Display course progress overlay when in that room
```

**4. Teacher Presence**
```typescript
// Teacher logs in, spawns as NPC in "office"
// Students see teacher avatar available for questions
// Clicking teacher avatar opens chat/video
```

---

## Conclusion

Building a Gather.town-inspired Learning Adventures campus is **feasible in 2–3 months** with a focused team. The key is:

1. **Start small**: Single building, 1 room, 2 users
2. **Use proven tools**: Phaser + Colyseus (industry-standard combo)
3. **Leverage community**: Grab free 32×32 tilesets from itch.io to bootstrap
4. **Iterate on education**: Audio/video works → add teaching features (whiteboards, office hours, progress tracking)
5. **Scale cautiously**: Test with 6, then 20, then 100 concurrent users before deployment

The spatial, avatar-based model resonates with students and teachers equally — it's inherently social, low-pressure, and discovery-oriented. A well-executed campus creates a place students *want* to visit, not just a tool they're forced to use.

---

## References & Resources

- **Phaser 3 Docs**: https://phaser.io/
- **Colyseus Docs**: https://docs.colyseus.io/
- **Tiled Map Editor**: https://www.mapeditor.org/
- **Gather.town 32×32 Tilesets**: https://itch.io/c/1904339
- **OpenGameArt Free Sprites**: https://opengameart.org/
- **simple-peer (WebRTC)**: https://github.com/feross/simple-peer
- **WebRTC Architectures**: https://medium.com/@toshvelaga/webrtc-architectures-mesh-mcu-and-sfu-12c502274d7
