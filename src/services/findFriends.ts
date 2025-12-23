import request from "@/services/request";
import { urlConfig } from "@/services/config/urlConfig";
import { getFindFriendsEndpoint } from "./findFriends/endpoints";

interface FindFriendsOptions {
  smiles: string[];
  use35m: boolean;
  structureWeight: number;
  molType?: string;
  computeLevel: string;
  includeQuery?: boolean;
  queryString?: string;
  isInorganic?: boolean;
  isAnion?: boolean;
  showHypothetical?: boolean;
  numResults?: number;
}

export interface FindFriendsResult<T = any> {
  molecules: T[];
  imageMap: { [key: number]: string };
  messages: string[];
}

export async function findFriends<T = any>(options: FindFriendsOptions): Promise<FindFriendsResult<T>> {
  const {
    smiles,
    use35m,
    structureWeight,
    molType,
    computeLevel,
    includeQuery,
    queryString,
    isInorganic = false,
    showHypothetical = false,
    isAnion = false,
    numResults,
  } = options;

  // Get environment-specific endpoint
  const env = urlConfig.getEnvironment();
  const endpoint = getFindFriendsEndpoint(env, 'findFriend');
  const url = urlConfig.buildFullURL(endpoint);
  const computeEnabled = computeLevel !== 'Disabled';
  const hasQuery = !!(queryString && queryString.trim().length > 0);

  const payload: any = {
    smiles,
    use_35m: use35m,
    structure_weight: structureWeight,
    ...(molType && { mol_type: molType }),
    ...(isInorganic && { is_inorganic: true }),
    ...(isAnion && { is_anion: true }),
    ...(computeEnabled && { llm_compute_power: computeLevel.toLowerCase() }),
    commercial_scores: showHypothetical ? [0, 1, 2, 3] : [1, 2, 3],
    ...(typeof numResults === 'number' ? { num_results: numResults } : {}),
    ...(hasQuery && {
      query: queryString,
      response: 'No additional context is available for this query.',
    }),
  };

  const response = await request(url, {
    method: 'POST',
    data: payload,
    headers: { 'Content-Type': 'application/json' },
  });

  if ((response as any).ok === false || response.status >= 400) {
    throw new Error(`Failed to fetch similar molecules: HTTP ${response.status}`);
  }

  const data = response.data;
  const molecules: T[] = data.similar_molecules || [];
  const messages: string[] = Array.isArray(data.messages)
    ? data.messages.map((message: any) => String(message))
    : [];

  const imageMap: { [key: number]: string } = {};
  molecules.forEach((mol: any, index: number) => {
    if (mol.image) {
      imageMap[index] = mol.image;
    }
  });

  return { molecules, imageMap, messages };
}
