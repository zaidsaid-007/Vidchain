import { canisterId, createActor } from "../../../declarations/vidchain_backend";

const vidChainActor = createActor(canisterId);

// Mapping of canister methods to actor functions
const actorMethods = {
  deleteVideo: vidChainActor.deleteVideo.bind(vidChainActor),
  dislikeVideo: vidChainActor.dislikeVideo.bind(vidChainActor),
  getAllVideos: vidChainActor.getAllVideos.bind(vidChainActor),
  getBalance: vidChainActor.getBalance.bind(vidChainActor),
  getChannelAnalytics: vidChainActor.getChannelAnalytics.bind(vidChainActor),
  getComments: vidChainActor.getComments.bind(vidChainActor),
  getPlaylists: vidChainActor.getPlaylists.bind(vidChainActor),
  getProfile: vidChainActor.getProfile.bind(vidChainActor),
  getTrendingVideos: vidChainActor.getTrendingVideos.bind(vidChainActor),
  getUserProfile: vidChainActor.getUserProfile.bind(vidChainActor),
  getUserVideos: vidChainActor.getUserVideos.bind(vidChainActor),
  getVideoById: vidChainActor.getVideoById.bind(vidChainActor),
  getVideosByCategory: vidChainActor.getVideosByCategory.bind(vidChainActor),
  likeVideo: vidChainActor.likeVideo.bind(vidChainActor),
  mintVideoNFT: vidChainActor.mintVideoNFT.bind(vidChainActor),
  reportVideo: vidChainActor.reportVideo.bind(vidChainActor),
  searchVideos: vidChainActor.searchVideos.bind(vidChainActor),
  stakeTokens: vidChainActor.stakeTokens.bind(vidChainActor),
  updateProfile: vidChainActor.updateProfile.bind(vidChainActor),
  uploadVideo: vidChainActor.uploadVideo.bind(vidChainActor),
  watchVideo: vidChainActor.watchVideo.bind(vidChainActor),
};

/**
 * Fetch data from the blockchain canister by calling a specified method.
 * @param {string} method - The name of the canister method to call.
 * @param {...any} args - The arguments to pass to the canister method.
 * @returns {Promise<any>} - The data returned from the canister.
 */
export const fetchFromBlockchain = async (method, ...args) => {
  try {
    const fn = actorMethods[method];
    if (typeof fn !== "function") {
      throw new Error(`Method "${method}" does not exist on the actor.`);
    }
    return await fn(...args);
  } catch (error) {
    console.error("Error fetching data from blockchain:", error);
    throw error;
  }
};
