import { IInsight } from '../interfaces/models/ICommon';

export const mockInsights: Record<string, IInsight> = {
  aereo: {
    modality: 'aereo',
    title: 'Insight da IA',
    description: 'Voar no domingo (08/06) e voltar na quinta (12/06) é historicamente 23% mais barato que as datas originais. Evitar sextas e segundas reduz o custo médio em R$287 nesta rota.',
    savingsAmount: 287,
  },
  hotel: {
    modality: 'hotel',
    title: 'Insight da IA',
    description: 'Check-in aos domingos em São Paulo apresenta tarifas até 30% menores. Reservar 3 noites a partir de 09/06 economiza R$440 em relação às datas originais.',
    savingsAmount: 440,
  },
  carro: {
    modality: 'carro',
    title: 'Insight da IA',
    description: 'Retirar o veículo no domingo reduz a diária em até 28%. A categoria Compacto na Localiza oferece a melhor relação custo-benefício para esta data.',
    savingsAmount: 191,
  },
  onibus: {
    modality: 'onibus',
    title: 'Insight da IA',
    description: 'Passagens rodoviárias para Brasília são até 32% mais baratas aos domingos. A Viação Cometa oferece o melhor preço para a data recomendada.',
    savingsAmount: 102,
  },
};
