import type { Artwork, Comment, Creator } from "../shared/types";

export const creators: Creator[] = [
  {
    id: "usr_mika",
    handle: "mika-lumen",
    displayName: "Mika Lumen",
    avatarUrl: "/artworks/avatar-mika.png",
    bio: "Editorial color scripts, quiet characters, neon storefronts.",
    followerCount: 24810,
    following: true
  },
  {
    id: "usr_sora",
    handle: "sora-grid",
    displayName: "Sora Grid",
    avatarUrl: "/artworks/avatar-sora.png",
    bio: "Poster studies and hard-edged city fragments.",
    followerCount: 17640,
    following: false
  },
  {
    id: "usr_ren",
    handle: "ren-ink",
    displayName: "Ren Ink",
    avatarUrl: "/artworks/avatar-ren.png",
    bio: "Ink texture, screen tone, compressed drama.",
    followerCount: 32190,
    following: true
  },
  {
    id: "usr_noa",
    handle: "noa-signal",
    displayName: "Noa Signal",
    avatarUrl: "/artworks/avatar-noa.png",
    bio: "Characters, gadgets, and night trains.",
    followerCount: 12930,
    following: false
  }
];

const creatorById = new Map(creators.map((creator) => [creator.id, creator]));

const getCreator = (id: string) => {
  const creator = creatorById.get(id);
  if (!creator) {
    throw new Error(`Missing seeded creator ${id}`);
  }
  return creator;
};

export const artworks: Artwork[] = [
  {
    id: "art_aurora_market",
    title: "Aurora Market",
    caption: "A late market lane after rain, blocked in like a color script.",
    imageUrl: "/artworks/aurora-market.png",
    thumbnailUrl: "/artworks/aurora-market.png",
    width: 1400,
    height: 1900,
    dominantColor: "#0f766e",
    creator: getCreator("usr_mika"),
    tags: ["city pop", "night", "original", "background"],
    likeCount: 12420,
    bookmarkCount: 3810,
    viewCount: 92400,
    commentCount: 82,
    createdAt: "2026-06-04T11:10:00.000Z",
    mature: false
  },
  {
    id: "art_blue_hour_train",
    title: "Blue Hour Train",
    caption: "Character sketch for a commuter who keeps missing the last stop.",
    imageUrl: "/artworks/blue-hour-train.png",
    thumbnailUrl: "/artworks/blue-hour-train.png",
    width: 1400,
    height: 1600,
    dominantColor: "#2563eb",
    creator: getCreator("usr_noa"),
    tags: ["character", "train", "blue hour", "original"],
    likeCount: 8980,
    bookmarkCount: 2410,
    viewCount: 66400,
    commentCount: 44,
    createdAt: "2026-06-06T09:26:00.000Z",
    mature: false
  },
  {
    id: "art_crimson_rooftop",
    title: "Crimson Rooftop",
    caption: "A rooftop composition study with a hard red key light.",
    imageUrl: "/artworks/crimson-rooftop.png",
    thumbnailUrl: "/artworks/crimson-rooftop.png",
    width: 1400,
    height: 1750,
    dominantColor: "#b91c1c",
    creator: getCreator("usr_ren"),
    tags: ["action", "rooftop", "ink", "red"],
    likeCount: 15110,
    bookmarkCount: 4950,
    viewCount: 110300,
    commentCount: 117,
    createdAt: "2026-06-05T15:48:00.000Z",
    mature: false
  },
  {
    id: "art_glass_courtyard",
    title: "Glass Courtyard",
    caption: "Interior concept with a soft winter palette and deep reflections.",
    imageUrl: "/artworks/glass-courtyard.png",
    thumbnailUrl: "/artworks/glass-courtyard.png",
    width: 1400,
    height: 2050,
    dominantColor: "#14b8a6",
    creator: getCreator("usr_mika"),
    tags: ["architecture", "interior", "winter", "concept"],
    likeCount: 7060,
    bookmarkCount: 2084,
    viewCount: 50130,
    commentCount: 31,
    createdAt: "2026-06-02T03:14:00.000Z",
    mature: false
  },
  {
    id: "art_signal_garden",
    title: "Signal Garden",
    caption: "A synthetic garden where every flower has a notification state.",
    imageUrl: "/artworks/signal-garden.png",
    thumbnailUrl: "/artworks/signal-garden.png",
    width: 1400,
    height: 1500,
    dominantColor: "#16a34a",
    creator: getCreator("usr_sora"),
    tags: ["graphic", "plants", "poster", "green"],
    likeCount: 10410,
    bookmarkCount: 3144,
    viewCount: 74300,
    commentCount: 55,
    createdAt: "2026-06-03T18:09:00.000Z",
    mature: false
  },
  {
    id: "art_static_halo",
    title: "Static Halo",
    caption: "Icon-heavy portrait pass with print texture and clipped shadows.",
    imageUrl: "/artworks/static-halo.png",
    thumbnailUrl: "/artworks/static-halo.png",
    width: 1400,
    height: 1820,
    dominantColor: "#f97316",
    creator: getCreator("usr_ren"),
    tags: ["portrait", "poster", "orange", "halftone"],
    likeCount: 18640,
    bookmarkCount: 6211,
    viewCount: 132500,
    commentCount: 151,
    createdAt: "2026-06-06T01:38:00.000Z",
    mature: false
  },
  {
    id: "art_lantern_cache",
    title: "Lantern Cache",
    caption: "Tiny corner shop for recovered memories and warm batteries.",
    imageUrl: "/artworks/lantern-cache.png",
    thumbnailUrl: "/artworks/lantern-cache.png",
    width: 1400,
    height: 1960,
    dominantColor: "#eab308",
    creator: getCreator("usr_noa"),
    tags: ["shop", "warm light", "story", "background"],
    likeCount: 9320,
    bookmarkCount: 2760,
    viewCount: 68820,
    commentCount: 49,
    createdAt: "2026-06-01T22:04:00.000Z",
    mature: false
  },
  {
    id: "art_cutpaper_moon",
    title: "Cutpaper Moon",
    caption: "Layered moonlit landscape made from torn paper silhouettes.",
    imageUrl: "/artworks/cutpaper-moon.png",
    thumbnailUrl: "/artworks/cutpaper-moon.png",
    width: 1400,
    height: 1700,
    dominantColor: "#475569",
    creator: getCreator("usr_sora"),
    tags: ["landscape", "moon", "paper", "quiet"],
    likeCount: 6840,
    bookmarkCount: 1910,
    viewCount: 42220,
    commentCount: 27,
    createdAt: "2026-05-31T08:45:00.000Z",
    mature: false
  }
];

export const comments: Record<string, Comment[]> = {
  art_static_halo: [
    {
      id: "cmt_1",
      author: "kiri-note",
      body: "The cropped shadow under the jaw is doing a lot of work.",
      createdAt: "2026-06-06T03:15:00.000Z"
    },
    {
      id: "cmt_2",
      author: "lineweight",
      body: "Print texture is controlled, especially in the orange field.",
      createdAt: "2026-06-06T05:20:00.000Z"
    }
  ],
  art_aurora_market: [
    {
      id: "cmt_3",
      author: "moss-pixel",
      body: "That wet pavement palette feels excellent.",
      createdAt: "2026-06-04T13:33:00.000Z"
    }
  ]
};
