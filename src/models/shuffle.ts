import type { PlayListDetails } from "./playlist";

export type MixerCategoryStats = {
  type: string;
  category: string;
  length: number;
};

export type MultipleShuffleProgressStatus = {
  current: number;
  total: number;
};

export type ShuffProgressStatus = {
  inProgress: boolean;
  shuffled: number;
  total: number;
  categories: MixerCategoryStats[];
  playList: PlayListDetails | undefined;
  multiple: MultipleShuffleProgressStatus | undefined;
};
