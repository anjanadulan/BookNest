export type Book = {
  id: number
  title: string
  author: string
  category: string
  categoryId?: number
  isbn?: string
  price: number
  rating: string
  format: string
  stock: number
  description: string
  cover: string
  accent: "lime" | "blue" | "orange" | "violet"
}

export const books: Book[] = [
  {
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    category: "Fiction",
    price: 15.99,
    rating: "4.8",
    format: "Classic",
    stock: 100,
    description:
      "The story of the mysteriously wealthy Jay Gatsby and his love for Daisy Buchanan, told in a sparkling portrait of longing, illusion, and the American dream.",
    cover:
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=900&q=85",
    accent: "lime",
  },
  {
    id: 2,
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    category: "Science",
    price: 18.99,
    rating: "4.9",
    format: "Long read",
    stock: 50,
    description:
      "An exploration of space, time, black holes, and the origin of the universe from one of the most important scientific thinkers of our time.",
    cover:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=85",
    accent: "blue",
  },
  {
    id: 3,
    title: "Sapiens",
    author: "Yuval Noah Harari",
    category: "History",
    price: 22,
    rating: "4.7",
    format: "Perspective",
    stock: 60,
    description:
      "A sweeping history of humankind, from early humans to modern revolutions, and the stories we tell ourselves to make sense of it all.",
    cover:
      "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=900&q=85",
    accent: "orange",
  },
  {
    id: 4,
    title: "Steve Jobs",
    author: "Walter Isaacson",
    category: "Biography",
    price: 24.99,
    rating: "4.6",
    format: "Biography",
    stock: 40,
    description:
      "The definitive portrait of the Apple co-founder: visionary, difficult, obsessive, and endlessly committed to making beautiful things useful.",
    cover:
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=900&q=85",
    accent: "violet",
  },
  {
    id: 5,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    category: "Fiction",
    price: 12.5,
    rating: "4.9",
    format: "Essential",
    stock: 80,
    description:
      "A moving novel about innocence, kindness, and cruelty, seen through the eyes of a child growing up in a divided Southern town.",
    cover:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=85",
    accent: "lime",
  },
]

export const categories = [
  "All books",
  "Fiction",
  "Science",
  "History",
  "Biography",
]

export const accentBorders: Record<Book["accent"], string> = {
  lime: "border-b-lime",
  blue: "border-b-blue",
  orange: "border-b-orange",
  violet: "border-b-violet",
}
