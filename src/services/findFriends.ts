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
  showHypothetical?: boolean;
}

export interface FindFriendsResult<T = any> {
  molecules: T[];
  imageMap: { [key: number]: string };
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
    ...(computeEnabled && { llm_compute_power: computeLevel.toLowerCase() }),
    commercial_viability_scores: showHypothetical ? [0, 1, 2, 3] : [1, 2, 3],
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

  const imageMap: { [key: number]: string } = {};
  molecules.forEach((mol: any, index: number) => {
    if (mol.image) {
      imageMap[index] = mol.image;
    }
  });

  return { molecules, imageMap };
}
