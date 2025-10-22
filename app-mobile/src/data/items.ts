export type Item = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
};

export const ITEMS: Item[] = Array.from({ length: 1000 }).map((_, i) => ({
  id: String(i + 1),
  title: `Registro #${i + 1}`,
  subtitle: `Descrição do item ${i + 1}`,
  date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
}));
