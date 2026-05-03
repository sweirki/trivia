// src/identity/avatars.ts

export type Avatar = {
  id: string;
  source: any;
};

export const AVATARS: Avatar[] = [
  {
    id: "avatar_01",
    source: require("@assets/images/avatar.png"),
  },
  {
    id: "avatar_02",
    source: require("@assets/images/avatar.png"),
  },
  {
    id: "avatar_03",
    source: require("@assets/images/avatar.png"),
  },
];

