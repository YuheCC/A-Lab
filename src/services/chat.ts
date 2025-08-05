import { authFetch, getAPIUrl } from '@/utils';

const API_URL = getAPIUrl();

export interface ChatMetadataPayload {
  chat_id: number;
  meta_active_molecule?: any;
  meta_molecules?: any;
  meta_similar_molecules?: any;
}

export const updateChatMetadata = async (payload: ChatMetadataPayload) => {
  const body: any = { chat_id: payload.chat_id };
  if (payload.meta_active_molecule !== undefined)
    body.meta_active_molecule = JSON.stringify(payload.meta_active_molecule);
  if (payload.meta_molecules !== undefined)
    body.meta_molecules = JSON.stringify(payload.meta_molecules);
  if (payload.meta_similar_molecules !== undefined)
    body.meta_similar_molecules = JSON.stringify(payload.meta_similar_molecules);

  return authFetch(`${API_URL}/chat-history/update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
};
