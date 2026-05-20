// Central data registry for all 5 worlds.

const worlds = [
  {
    id: 0,
    slug: 'world-02',
    name: 'Luminara',
    chapter: 'Chapter I',
    title: 'The Hollow\nKingdom',
    subtitle: 'Unreal Engine 5 · Blender · Substance 3D',
    accentColor: '#7c5cc4',
    accentRGB: [124, 92, 196],
    framesPath: 'https://pub-88341f47988743aba3154d2af5c6327e.r2.dev/world-02/',
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
    id: 1,
    slug: 'world-01',
    name: 'Ashfall',
    chapter: 'Chapter II',
    title: 'Where Light\nStill Reaches',
    subtitle: 'Unreal Engine 5 · Blender · Substance 3D',
    accentColor: '#c46428',
    accentRGB: [196, 100, 40],
    framesPath: 'https://pub-88341f47988743aba3154d2af5c6327e.r2.dev/world-01/',
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
    id: 2,
    slug: 'world-03',
    name: 'Verdant',
    chapter: 'Chapter III',
    title: 'Beyond The\nLast Ridge',
    subtitle: 'Unreal Engine 5 · Blender · Substance 3D',
    accentColor: '#3a8c52',
    accentRGB: [58, 140, 82],
    framesPath: 'https://pub-88341f47988743aba3154d2af5c6327e.r2.dev/world-03/',
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
    name: 'Helios',
    chapter: 'Chapter IV',
    title: 'The Burning\nDistrict',
    subtitle: 'Unreal Engine 5 · Blender · Substance 3D',
    accentColor: '#2872c4',
    accentRGB: [40, 114, 196],
    framesPath: 'https://pub-88341f47988743aba3154d2af5c6327e.r2.dev/world-04/',
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
    name: 'Aurum',
    chapter: 'Chapter V',
    title: 'Void\nArchitecture',
    subtitle: 'Unreal Engine 5 · Blender · Substance 3D',
    accentColor: '#c4a028',
    accentRGB: [196, 160, 40],
    framesPath: 'https://pub-88341f47988743aba3154d2af5c6327e.r2.dev/world-05/',
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
