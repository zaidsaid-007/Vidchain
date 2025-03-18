import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { idlFactory as vidchainIdlFactory } from '../declarations/vidchain_backend/vidchain_backend.did';
import { canisterId as vidchainCanisterId } from '../declarations/vidchain_backend/index';
import { VidChainClient } from './vidchain-api';

// Create an agent with the production host.
const agent = new HttpAgent({ host: 'https://ic0.app' });
if (process.env.NODE_ENV !== 'production') {
  // For local development only.
  agent.fetchRootKey();
}

// Create an actor using the generated idlFactory and canisterId.
const actor = Actor.createActor(vidchainIdlFactory, {
  agent,
  canisterId: vidchainCanisterId,
});

// Instantiate the API client.
export const vidchainClient = new VidChainClient(actor);
