import { getTrack, getTracks, searchCatalog, MOCK_TRACKS } from "./catalog.ts";
import type { Track } from "./types.ts";

export type HomeFeed = {
  continueTrack: Track | null;
  suggested: Track[];
  trendingChannels: string[];
};

export interface MediaProvider {
  readonly id: string;
  readonly label: string;
  readonly connected: boolean;
  search(query: string): Promise<Track[]>;
  getById(id: string): Promise<Track | null>;
  getByIds(ids: string[]): Promise<Track[]>;
  getHomeFeed(continueId?: string): Promise<HomeFeed>;
}

export class MockYouTubeProvider implements MediaProvider {
  readonly id = "mock-youtube";
  readonly label = "Offline catalog";
  readonly connected = false;

  async search(query: string): Promise<Track[]> {
    return searchCatalog(query);
  }

  async getById(id: string): Promise<Track | null> {
    return getTrack(id) ?? null;
  }

  async getByIds(ids: string[]): Promise<Track[]> {
    return getTracks(ids);
  }

  async getHomeFeed(continueId?: string): Promise<HomeFeed> {
    const continueTrack = continueId ? (getTrack(continueId) ?? null) : null;
    const suggested = MOCK_TRACKS.filter(
      (t) => t.status === "playable" && t.id !== continueId,
    ).slice(0, 10);
    const trendingChannels = [
      ...new Set(suggested.map((t) => t.channel)),
    ].slice(0, 6);
    return { continueTrack, suggested, trendingChannels };
  }
}

let currentProvider: MediaProvider = new MockYouTubeProvider();

export function getMediaProvider(): MediaProvider {
  return currentProvider;
}

export function setMediaProvider(provider: MediaProvider): void {
  currentProvider = provider;
}
