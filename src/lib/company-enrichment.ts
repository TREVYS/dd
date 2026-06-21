export type SireneEnrichment = {
  legalName: string | null;
  commercialName: string | null;
  siret: string | null;
  legalForm: string | null;
  apeCode: string | null;
  activityDescription: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  creationDate: Date | null;
};

export async function enrichFromSirene(siren: string): Promise<SireneEnrichment | null> {
  try {
    const res = await fetch(
      `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(siren)}&page=1&per_page=1`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const result = data.results?.[0];
    if (!result) return null;

    const siege = result.siege ?? {};
    return {
      legalName: result.nom_complet ?? result.nom_raison_sociale ?? null,
      commercialName: result.nom_commercial ?? siege.nom_commercial ?? null,
      siret: siege.siret ?? null,
      legalForm: result.nature_juridique ?? null,
      apeCode: result.activite_principale ?? siege.activite_principale ?? null,
      activityDescription: result.libelle_activite_principale ?? siege.libelle_activite_principale ?? null,
      address: siege.adresse ?? null,
      postalCode: siege.code_postal ?? null,
      city: siege.libelle_commune ?? null,
      creationDate: result.date_creation ? new Date(result.date_creation) : null,
    };
  } catch {
    return null;
  }
}

export type DirigeantEnrichment = {
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  birthDate: Date | null;
  nationality: string | null;
};

export async function enrichDirigeantsFromPappers(siren: string): Promise<DirigeantEnrichment[]> {
  const apiKey = process.env.PAPPERS_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch(
      `https://api.pappers.fr/v2/entreprise?api_token=${apiKey}&siren=${encodeURIComponent(siren)}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    const dirigeants = Array.isArray(data.dirigeants) ? data.dirigeants : [];

    return dirigeants.map((d: {
      prenom?: string;
      nom?: string;
      qualite?: string;
      date_de_naissance?: string;
      nationalite?: string;
    }) => ({
      firstName: d.prenom ?? null,
      lastName: d.nom ?? null,
      role: d.qualite ?? null,
      birthDate: d.date_de_naissance ? new Date(d.date_de_naissance) : null,
      nationality: d.nationalite ?? null,
    }));
  } catch {
    return [];
  }
}
