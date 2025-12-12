import { authFetch, getAPIUrl } from "@/utils";

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
  prioritizePublished?: boolean;
  numResults?: number;
  umapType?: string;
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
    prioritizePublished,
    numResults,
    umapType,
  } = options;

  const API_URL = getAPIUrl();
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
    ...(isAnion ? {} : { apply_published_balance: prioritizePublished ?? true }),
    ...(typeof numResults === 'number' ? { num_results: numResults } : {}),
    ...(umapType ? { umap_type: umapType } : {}),
    ...(hasQuery && {
      query: queryString,
      response: 'No additional context is available for this query.',
    }),
  };

  const response = await authFetch(`${API_URL}/api/llm/find-friend-with-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch similar molecules: ${response.statusText}`);
  }

  const data = await response.json();
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
