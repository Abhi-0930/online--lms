export type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  avatarUrl?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export * from "./_core/errors";
