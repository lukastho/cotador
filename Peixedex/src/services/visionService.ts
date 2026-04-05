export interface FishIdentification {
  name: string;
  scientificName: string;
  rarity: 'Comum' | 'Raro' | 'Épico' | 'Lendário';
  description: string;
}

const MOCK_FISH: FishIdentification[] = [
  {
    name: 'Tucunaré',
    scientificName: 'Cichla ocellaris',
    rarity: 'Comum',
    description: 'Um dos peixes mais famosos do Brasil, conhecido por sua agressividade e cores vibrantes.',
  },
  {
    name: 'Tambaqui',
    scientificName: 'Colossoma macropomum',
    rarity: 'Comum',
    description: 'Um peixe de água doce de grande porte, muito apreciado na culinária amazônica.',
  },
  {
    name: 'Piranha Preta',
    scientificName: 'Serrasalmus rhombeus',
    rarity: 'Raro',
    description: 'Famosa por sua mordida poderosa, é um predador voraz dos rios brasileiros.',
  },
  {
    name: 'Pintado',
    scientificName: 'Pseudoplatystoma corruscans',
    rarity: 'Épico',
    description: 'Um grande peixe de couro, reconhecido pelas manchas pretas em seu corpo cinza.',
  },
  {
    name: 'Pirarucu',
    scientificName: 'Arapaima gigas',
    rarity: 'Lendário',
    description: 'O gigante das águas doces, pode atingir tamanhos colossais e é um símbolo da Amazônia.',
  },
];

export const visionService = {
  identifyFish: async (imageUri: string): Promise<FishIdentification> => {
    // Simula um delay de rede de 2 segundos
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Retorna um peixe aleatório da lista
    const randomIndex = Math.floor(Math.random() * MOCK_FISH.length);
    return MOCK_FISH[randomIndex];
  },
};
