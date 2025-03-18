// src/api/vidchain-api.ts

import { ActorSubclass, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { _SERVICE } from '../declarations/vidchain_backend/vidchain_backend.did';

export type VideoId = bigint;
export type TokenAmount = bigint;

export type Category =
  | { LongForm: null }
  | { Short: null }
  | { Entertainment: null }
  | { Education: null }
  | { Gaming: null }
  | { Music: null }
  | { Technology: null }
  | { Other: null };


export type Video = {
  id: VideoId;
  title: string;
  description: string;
  category: Category;
  channel: string;
  uploader: Principal;
  timestamp: bigint;
  duration: number;
  media: {
    content: Uint8Array;
    thumbnail: Uint8Array;
    isShort: boolean;
    contentType: string;
  };
  views: number;
  likes: number;
  dislikes: number;
  tokenRewards: TokenAmount;
  isDeleted: boolean;
};

export type Result<T, E> = { Ok: T } | { Err: E };


export interface Profile {
  name: string;
  email: [] | [string];
  channelName: string;
  totalViews: bigint;
  tokenBalance: bigint;
}

export type VidChainError =
  | { Unauthorized: null }
  | { VideoNotFound: null }
  | { InsufficientTokens: null }
  | { InvalidContent: null }
  | { DuplicateAction: null }
  | { ReportLimitExceeded: null }
  | { InvalidCategory: null }
  | { InvalidDuration: null };

export interface VidChainAPI {
  // User Profile
  updateProfile: (profile: {
    name: string;
    email?: string;
    gender?: string;
    birthday?: bigint;
  }) => Promise<Result<void, VidChainError>>;

  getProfile: () => Promise<Result<{
    name: string;
    email?: string;
    channelName: string;
    totalViews: number;
    tokenBalance: number;
  }, VidChainError>>;

  // Video Operations
  uploadVideo: (data: {
    title: string;
    description: string;
    category: Category;
    channel: string;
    media: File;
    thumbnail: File;
    duration: number;
    isShort: boolean;
  }) => Promise<Result<VideoId, VidChainError>>;

  deleteVideo: (videoId: VideoId) => Promise<Result<void, VidChainError>>;

  // Content Interaction
  watchVideo: (videoId: VideoId) => Promise<Result<void, VidChainError>>;
  likeVideo: (videoId: VideoId) => Promise<Result<void, VidChainError>>;
  reportVideo: (
    videoId: VideoId,
    reason: string
  ) => Promise<Result<void, VidChainError>>;

  // Token Economy
  stakeTokens: (amount: TokenAmount) => Promise<Result<void, VidChainError>>;
  getBalance: () => Promise<Result<TokenAmount, VidChainError>>;

  // NFT Integration
  mintVideoNFT: (
    videoId: VideoId,
    contractAddress: string
  ) => Promise<Result<void, VidChainError>>;

  // Search & Discovery
  searchVideos: (
    query: string,
    category?: Category
  ) => Promise<Result<Video[], VidChainError>>;

  getTrendingVideos: () => Promise<Result<Video[], VidChainError>>;

  // Analytics
  getChannelAnalytics: () => Promise<Result<{
    totalViews: number;
    avgWatchTime: number;
    popularContent: Video[];
  }, VidChainError>>;
}

// VidChainClient class that implements the API interface
export class VidChainClient implements VidChainAPI {
  private actor: ActorSubclass<_SERVICE>;

  constructor(actor: ActorSubclass<_SERVICE>) {
    this.actor = actor;
  }

  // User Profile
  async updateProfile(profile: {
    name: string;
    email?: string;
    gender?: string;
    birthday?: bigint;
  }): Promise<Result<void, VidChainError>> {
    try {
      await this.actor.updateProfile({
        name: profile.name,
        email: profile.email ? [profile.email] : [],
        gender: profile.gender ? [profile.gender] : [],
        birthday: profile.birthday ? [profile.birthday] : []
      });
      return { Ok: undefined };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getProfile(): Promise<Result<{
    name: string;
    email?: string;
    channelName: string;
    totalViews: number;
    tokenBalance: number;
  }, VidChainError>> {
    try {
      return await this.actor.getProfile();
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Video Operations
  async uploadVideo(data: {
    title: string;
    description: string;
    category: Category;
    channel: string;
    media: File;
    thumbnail: File;
    duration: number;
    isShort: boolean;
  }): Promise<Result<VideoId, VidChainError>> {
    try {
      const [mediaContent, thumbnailContent] = await Promise.all([
        this.fileToUint8Array(data.media),
        this.fileToUint8Array(data.thumbnail)
      ]);
      return await this.actor.uploadVideo({
        title: data.title,
        description: data.description,
        category: data.category,
        channel: data.channel,
        media: mediaContent,
        thumbnail: thumbnailContent,
        duration: BigInt(data.duration),
        isShort: data.isShort,
        contentType: data.media.type
      });
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteVideo(videoId: VideoId): Promise<Result<void, VidChainError>> {
    try {
      return await this.actor.deleteVideo(videoId);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Content Interaction
  async watchVideo(videoId: VideoId): Promise<Result<void, VidChainError>> {
    try {
      return await this.actor.watchVideo(videoId);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async likeVideo(videoId: VideoId): Promise<Result<void, VidChainError>> {
    try {
      return await this.actor.likeVideo(videoId);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async reportVideo(
    videoId: VideoId,
    reason: string
  ): Promise<Result<void, VidChainError>> {
    try {
      return await this.actor.reportVideo(videoId, reason);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Token Economy
  async stakeTokens(amount: TokenAmount): Promise<Result<void, VidChainError>> {
    try {
      return await this.actor.stakeTokens(amount);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getBalance(): Promise<Result<TokenAmount, VidChainError>> {
    try {
      return await this.actor.getBalance();
    } catch (error) {
      return this.handleError(error);
    }
  }

  // NFT Integration
  async mintVideoNFT(
    videoId: VideoId,
    contractAddress: string
  ): Promise<Result<void, VidChainError>> {
    try {
      return await this.actor.mintVideoNFT(videoId, contractAddress);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Search & Discovery
  async searchVideos(
    query: string,
    category?: Category
  ): Promise<Result<Video[], VidChainError>> {
    try {
      return await this.actor.searchVideos(query, category);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getTrendingVideos(): Promise<Result<Video[], VidChainError>> {
    try {
      return await this.actor.getTrendingVideos();
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Analytics
  async getChannelAnalytics(): Promise<Result<{
    totalViews: number;
    avgWatchTime: number;
    popularContent: Video[];
  }, VidChainError>> {
    try {
      return await this.actor.getChannelAnalytics();
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Helper: convert File to Uint8Array
  private async fileToUint8Array(file: File): Promise<Uint8Array> {
    return new Uint8Array(await file.arrayBuffer());
  }

  // Error handler
  private handleError(error: unknown): { Err: VidChainError } {
    const defaultError: VidChainError = 'InvalidContent';
    const errorString = error instanceof Error ? error.message : String(error);
    return {
      Err: (errorString as VidChainError) || defaultError,
    };
  }
}
