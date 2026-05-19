export type ProductCategory = "collaboration" | "featured";

export type Product = {
  id: string;
  title: string;
  category: ProductCategory;
  subtitle: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  price?: number;
  salePrice?: number;
  sku?: string;
  stock?: number;
  detailBody?: string;
  detailImages?: string[];
  options?: Array<{ name: string; values: string[] }>;
  shippingNote?: string;
};

export type JournalPost = {
  id: string;
  title: string;
  summary: string;
  body: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type AequalisContent = {
  products: Product[];
  journals: JournalPost[];
};

export const AEQUALIS_STORAGE_KEY = "aequalis-admin-content-v1";

const now = "2026-05-19T00:00:00.000Z";

export const productCategoryLabels: Record<ProductCategory, string> = {
  collaboration: "collaboration matrix",
  featured: "featured collection",
};

export const defaultContent: AequalisContent = {
  products: [
    {
      id: "product-collab-seone",
      title: "aequalis x seone",
      category: "collaboration",
      subtitle: "artisan shoemaker",
      description: "artisan series",
      imageUrl: "/images/aequalis/collab-seone.png",
      linkUrl: "#shop",
      isActive: true,
      sortOrder: 10,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "product-collab-skono",
      title: "aequalis x SKONO",
      category: "collaboration",
      subtitle: "brand collaboration",
      description: "casual luxury line",
      imageUrl: "/images/aequalis/collab-skono.png",
      linkUrl: "#shop",
      isActive: true,
      sortOrder: 20,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "product-collab-hyundai",
      title: "aequalis x Hyundai Department Store",
      category: "collaboration",
      subtitle: "retail exclusive",
      description: "",
      imageUrl: "/images/aequalis/collab-hyundai.png",
      linkUrl: "#shop",
      isActive: true,
      sortOrder: 30,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "product-collab-shinsegae",
      title: "aequalis x Shinsegae",
      category: "collaboration",
      subtitle: "exclusive capsule",
      description: "",
      imageUrl: "/images/aequalis/collab-shinsegae.png",
      linkUrl: "#shop",
      isActive: true,
      sortOrder: 40,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "product-featured-derby",
      title: "artisan derby",
      category: "featured",
      subtitle: "artisan series",
      description: "",
      imageUrl: "/images/aequalis/featured-derby.png",
      linkUrl: "#shop",
      isActive: true,
      sortOrder: 10,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "product-featured-bag",
      title: "soft structure bag",
      category: "featured",
      subtitle: "foundation line",
      description: "",
      imageUrl: "/images/aequalis/featured-bag.png",
      linkUrl: "#shop",
      isActive: true,
      sortOrder: 20,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "product-featured-jacket",
      title: "minimal shirt jacket",
      category: "featured",
      subtitle: "foundation line",
      description: "",
      imageUrl: "/images/aequalis/featured-jacket.png",
      linkUrl: "#shop",
      isActive: true,
      sortOrder: 30,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "product-featured-ring",
      title: "parallel ring",
      category: "featured",
      subtitle: "retail exclusive",
      description: "",
      imageUrl: "/images/aequalis/featured-ring.png",
      linkUrl: "#shop",
      isActive: true,
      sortOrder: 40,
      createdAt: now,
      updatedAt: now,
    },
  ],
  journals: [
    {
      id: "journal-parallel-values",
      title: "on parallel values",
      summary: "우리는 위도 아래도 아닌, 나란히 존재하기를 선택했다.",
      body: "우리는 위도 아래도 아닌, 나란히 존재하기를 선택했다.",
      imageUrl: "/images/aequalis/journal-values.png",
      linkUrl: "#journal",
      isActive: true,
      sortOrder: 10,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "journal-designing-artisans",
      title: "designing with artisans",
      summary: "보이는 것 너머의 가치, 장인과의 협업으로 완성된다.",
      body: "보이는 것 너머의 가치, 장인과의 협업으로 완성된다.",
      imageUrl: "/images/aequalis/journal-artisans.png",
      linkUrl: "#journal",
      isActive: true,
      sortOrder: 20,
      createdAt: now,
      updatedAt: now,
    },
  ],
};

export function getDefaultContent(): AequalisContent {
  return {
    products: defaultContent.products.map((product) => ({ ...product })),
    journals: defaultContent.journals.map((post) => ({ ...post })),
  };
}

export function getDefaultContentSnapshot() {
  return JSON.stringify(getDefaultContent());
}

export function getStoredContentSnapshot() {
  if (typeof window === "undefined") {
    return getDefaultContentSnapshot();
  }

  return (
    window.localStorage.getItem(AEQUALIS_STORAGE_KEY) ??
    getDefaultContentSnapshot()
  );
}

function isProduct(value: unknown): value is Product {
  const product = value as Partial<Product>;

  return (
    typeof product?.id === "string" &&
    typeof product.title === "string" &&
    (product.category === "collaboration" || product.category === "featured") &&
    typeof product.subtitle === "string" &&
    typeof product.description === "string" &&
    typeof product.imageUrl === "string" &&
    typeof product.linkUrl === "string" &&
    typeof product.isActive === "boolean" &&
    typeof product.sortOrder === "number" &&
    typeof product.createdAt === "string" &&
    typeof product.updatedAt === "string"
  );
}

function isJournalPost(value: unknown): value is JournalPost {
  const post = value as Partial<JournalPost>;

  return (
    typeof post?.id === "string" &&
    typeof post.title === "string" &&
    typeof post.summary === "string" &&
    typeof post.body === "string" &&
    typeof post.imageUrl === "string" &&
    typeof post.linkUrl === "string" &&
    typeof post.isActive === "boolean" &&
    typeof post.sortOrder === "number" &&
    typeof post.createdAt === "string" &&
    typeof post.updatedAt === "string"
  );
}

export function normalizeAequalisContent(value: unknown): AequalisContent {
  const content = value as Partial<AequalisContent>;
  const fallback = getDefaultContent();

  return {
    products: Array.isArray(content?.products)
      ? content.products.filter(isProduct)
      : fallback.products,
    journals: Array.isArray(content?.journals)
      ? content.journals.filter(isJournalPost)
      : fallback.journals,
  };
}

export function sortByDisplayOrder<T extends { sortOrder: number; createdAt: string }>(
  items: T[],
) {
  return [...items].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }

    return a.createdAt.localeCompare(b.createdAt);
  });
}

export function readStoredContent(): AequalisContent {
  if (typeof window === "undefined") {
    return getDefaultContent();
  }

  const raw = window.localStorage.getItem(AEQUALIS_STORAGE_KEY);

  if (!raw) {
    return getDefaultContent();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AequalisContent>;

    return {
      products: Array.isArray(parsed.products)
        ? parsed.products
        : getDefaultContent().products,
      journals: Array.isArray(parsed.journals)
        ? parsed.journals
        : getDefaultContent().journals,
    };
  } catch {
    return getDefaultContent();
  }
}

export function writeStoredContent(content: AequalisContent) {
  window.localStorage.setItem(AEQUALIS_STORAGE_KEY, JSON.stringify(content));
  window.dispatchEvent(new Event("aequalis-content-updated"));
}

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
