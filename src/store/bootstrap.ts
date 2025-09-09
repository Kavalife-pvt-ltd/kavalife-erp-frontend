// src/store/bootstrap.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { fetchAllProducts, fetchAllUsers, fetchAllVendors } from '@/api/bootstrap';
import type { Vendor, Product, UserLite } from '@/types/bootstrap';

type Id = number;

interface BootstrapState {
  // full lists
  vendors: Vendor[];
  products: Product[];
  users: UserLite[];

  // normalized maps (id -> full object)
  vendorById: Record<Id, Vendor>;
  productById: Record<Id, Product>;
  userById: Record<Id, UserLite>;

  loaded: boolean;
  loading: boolean;
  error?: string;

  load: () => Promise<void>; // one-time after login/app mount
  refresh: () => Promise<void>; // manual refresh button etc.
  clear: () => void;

  // getters (fast lookups, return FULL records)
  getVendor: (id?: Id | null) => Vendor | undefined;
  getProduct: (id?: Id | null) => Product | undefined;
  getUser: (id?: Id | null) => UserLite | undefined;
}

export const useBootstrapStore = create<BootstrapState>()(
  persist(
    (set, get) => ({
      vendors: [],
      products: [],
      users: [],

      vendorById: {},
      productById: {},
      userById: {},

      loaded: false,
      loading: false,

      getVendor: (id) => (id == null ? undefined : get().vendorById[id]),
      getProduct: (id) => (id == null ? undefined : get().productById[id]),
      getUser: (id) => (id == null ? undefined : get().userById[id]),

      clear: () =>
        set({
          vendors: [],
          products: [],
          users: [],
          vendorById: {},
          productById: {},
          userById: {},
          loaded: false,
          loading: false,
          error: undefined,
        }),

      load: async () => {
        const s = get();
        if (s.loading || s.loaded) return; // avoid duplicate loads
        set({ loading: true, error: undefined });
        try {
          const [vendors, products, users] = await Promise.all([
            fetchAllVendors(),
            fetchAllProducts(),
            fetchAllUsers(),
          ]);

          const vendorById = Object.fromEntries(vendors.map((v) => [v.id, v]));
          const productById = Object.fromEntries(products.map((p) => [p.id, p]));
          const userById = Object.fromEntries(users.map((u) => [u.id, u]));

          set({
            vendors,
            products,
            users,
            vendorById,
            productById,
            userById,
            loaded: true,
            loading: false,
            error: undefined,
          });
        } catch (e) {
          const message = e instanceof Error ? e.message : 'Failed to load bootstrap data';
          set({ loading: false, error: message });
        }
      },

      refresh: async () => {
        set({ loading: true, error: undefined });
        try {
          const [vendors, products, users] = await Promise.all([
            fetchAllVendors(),
            fetchAllProducts(),
            fetchAllUsers(),
          ]);
          const vendorById = Object.fromEntries(vendors.map((v) => [v.id, v]));
          const productById = Object.fromEntries(products.map((p) => [p.id, p]));
          const userById = Object.fromEntries(users.map((u) => [u.id, u]));

          set({
            vendors,
            products,
            users,
            vendorById,
            productById,
            userById,
            loaded: true,
            loading: false,
            error: undefined,
          });
        } catch (e) {
          const message = e instanceof Error ? e.message : 'Failed to refresh bootstrap data';
          set({ loading: false, error: message });
        }
      },
    }),
    {
      name: 'bootstrap-cache',
      storage: createJSONStorage(() => localStorage),
      version: 1, // bump to reset when type shapes change
    }
  )
);
