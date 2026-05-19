// Central data registry for all 5 worlds.
// Accent colors and world names are placeholders — update after color analysis.
// Titles and project data are placeholders — update when worlds are named.

const worlds = [
  {
    id: 0,
    slug: 'world-01',
    name: 'World 01',
    chapter: 'Chapter I',
    title: 'Where Light\nStill Reaches',
    subtitle: 'Unreal Engine 5 · Blender · Substance 3D',
    accentColor: '#d4b896',        // TBD — warm amber placeholder
    accentRGB: [212, 184, 150],    // TBD
    framesPath: 'assets/frames-webp/world-01/',
    frameCount: 111,
    sourcePattern: 'NewLevelSequence.Layer1.%04d.jpeg',
    sourceStart: 1,
    ambientAudio: 'assets/audio/world-01-ambient.ogg',
    mangoMoment: 'TBD',
    projects: [
      {
        title: 'Project 01',
        type: 'Environment Design',
        description: 'Cinematic environment built in Unreal Engine 5.',
      },
      {
        title: 'Project 02',
        type: 'Lighting & Atmosphere',
        description: 'Volumetric lighting and atmospheric depth pass.',
      },
      {
        title: 'Project 03',
        type: 'VFX',
        description: 'Particle and post-process visual effects sequence.',
      },
    ],
  },

  {
    id: 1,
    slug: 'world-02',
    name: 'World 02',
    chapter: 'Chapter II',
    title: 'The Hollow\nKingdom',
    subtitle: 'Unreal Engine 5 · Blender · Substance 3D',
    accentColor: '#96c4d4',        // TBD — cold steel placeholder
    accentRGB: [150, 196, 212],    // TBD
    framesPath: 'assets/frames-webp/world-02/',
    frameCount: 165,
    sourcePattern: 'WAY.Layer1.%04d.jpeg',
    sourceStart: 0,
    ambientAudio: 'assets/audio/world-02-ambient.ogg',
    mangoMoment: 'TBD',
    projects: [
      {
        title: 'Project 01',
        type: 'Environment Design',
        description: 'Cinematic environment built in Unreal Engine 5.',
      },
      {
        title: 'Project 02',
        type: 'Character Design',
        description: 'Character creation and rigging in Character Creator 4.',
      },
      {
        title: 'Project 03',
        type: 'Compositing',
        description: 'Multi-pass compositing and color grading in DaVinci Resolve.',
      },
    ],
  },

  {
    id: 2,
    slug: 'world-03',
    name: 'World 03',
    chapter: 'Chapter III',
    title: 'Beyond The\nLast Ridge',
    subtitle: 'Unreal Engine 5 · Blender · Substance 3D',
    accentColor: '#96d4b0',        // TBD — muted teal placeholder
    accentRGB: [150, 212, 176],    // TBD
    framesPath: 'assets/frames-webp/world-03/',
    frameCount: 124,
    sourcePattern: 'NewLevel.%04d.jpeg',
    sourceStart: 0,
    ambientAudio: 'assets/audio/world-03-ambient.ogg',
    mangoMoment: 'TBD',
    projects: [
      {
        title: 'Project 01',
        type: 'Environment Design',
        description: 'Cinematic environment built in Unreal Engine 5.',
      },
      {
        title: 'Project 02',
        type: 'Texture & Materials',
        description: 'Material authoring and texturing in Substance 3D Painter.',
      },
      {
        title: 'Project 03',
        type: 'Animation',
        description: 'Cloth simulation and character animation in Marvelous Designer.',
      },
    ],
  },

  {
    id: 3,
    slug: 'world-04',
    name: 'World 04',
    chapter: 'Chapter IV',
    title: 'The Burning\nDistrict',
    subtitle: 'Unreal Engine 5 · Blender · Substance 3D',
    accentColor: '#d4c896',        // TBD — pale gold placeholder
    accentRGB: [212, 200, 150],    // TBD
    framesPath: 'assets/frames-webp/world-04/',
    frameCount: 179,
    sourcePattern: 'NewlSequence.Layer1.%04d.jpeg',
    sourceStart: 4,
    ambientAudio: 'assets/audio/world-04-ambient.ogg',
    mangoMoment: 'TBD',
    projects: [
      {
        title: 'Project 01',
        type: 'Environment Design',
        description: 'Cinematic environment built in Unreal Engine 5.',
      },
      {
        title: 'Project 02',
        type: 'Motion Graphics',
        description: 'Motion graphics and title design in After Effects.',
      },
      {
        title: 'Project 03',
        type: 'VFX',
        description: 'Particle and post-process visual effects sequence.',
      },
    ],
  },

  {
    id: 4,
    slug: 'world-05',
    name: 'World 05',
    chapter: 'Chapter V',
    title: 'Void\nArchitecture',
    subtitle: 'Unreal Engine 5 · Blender · Substance 3D',
    accentColor: '#c4a0a0',        // TBD — muted rose placeholder
    accentRGB: [196, 160, 160],    // TBD
    framesPath: 'assets/frames-webp/world-05/',
    frameCount: 375,
    sourcePattern: 'NewLevelSequence1.Layer1.%04d.jpeg',
    sourceStart: 0,
    ambientAudio: 'assets/audio/world-05-ambient.ogg',
    mangoMoment: 'TBD',
    projects: [
      {
        title: 'Project 01',
        type: 'Environment Design',
        description: 'Cinematic environment built in Unreal Engine 5.',
      },
      {
        title: 'Project 02',
        type: 'Character Design',
        description: 'Character creation and rigging in Character Creator 4.',
      },
      {
        title: 'Project 03',
        type: 'Compositing',
        description: 'Multi-pass compositing and color grading in DaVinci Resolve.',
      },
    ],
  },
];

export default worlds;
