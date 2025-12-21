export type Category = {
  id: bigint;
  slug: string;
  name: string;
  description: string | null;
};

export type ThreadDeatils = {
  id: bigint;
  title: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  category: {
    slug: string;
    name: string;
  };
  author: {
    displayName: string | null;
    handle: string | null;
  };
};

export type ThreadListFilter = {
  page: number;
  pageSize: number;
  categorySlug?: string;
  search?: string;
  sort: "new" | "old";
};

export type ThreadSummary = {
  id: bigint;
  title: string;
  excerpt: string;
  createdAt: Date;
  category: {
    slug: string;
    name: string;
  };
  author: {
    displayName: string | null;
    handle: string | null;
  };
};
