import treinoDeFala from '/treino-de-fala.pdf?url'

export type ClinicMaterial = { id: string; name: string; url: string }

// Material que já vem com o sistema (RF-16). O arquivo mora na raiz do repositório e o build o embute.
export const CLINIC_MATERIALS: ClinicMaterial[] = [{ id: 'treino-de-fala', name: 'treino-de-fala.pdf', url: treinoDeFala }]
