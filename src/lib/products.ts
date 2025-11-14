export type Product = {
  id: number;
  name: string;
  set: string;
  grade: number | null;
  price: number;
  image: string;
  serialNumber: string | null;
  description?: string;
};

export const products: Product[] = [
  {
    id: 1,
    name: "Charizard Base Set Holo",
    set: "Base Set",
    grade: 10,
    price: 12500,
    image: "/placeholder.svg",
    serialNumber: "NAZ-2024-001234",
    description: "A classic Charizard from the Base Set. High demand collectible.",
  },
  {
    id: 2,
    name: "Pikachu VMAX Rainbow",
    set: "Vivid Voltage",
    grade: 9.5,
    price: 850,
    image: "/placeholder.svg",
    serialNumber: "NAZ-2024-001235",
    description: "Rare Pikachu VMAX Rainbow with vibrant foil and excellent centering.",
  },
  {
    id: 3,
    name: "Blastoise Base Set Holo",
    set: "Base Set",
    grade: 9,
    price: 3200,
    image: "/placeholder.svg",
    serialNumber: "NAZ-2024-001236",
    description: "Blastoise classic holo, a collector favourite.",
  },
];

export function getProductById(id: number) {
  return products.find((p) => p.id === id) ?? null;
}
