// src/store/bootstrap.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  fetchAllProducts,
  fetchAllUsers,
  fetchAllVendors,
  Product, // your full product shape (not just id/name)
  UserLite, // or your full user shape
  Vendor, // your full vendor shape
} from '@/api/bootstrap';

type Id = number;

interface BootstrapState {
  // Full objects
  vendors: Vendor[];
  products: Product[];
  users: UserLite[];

  // Normalized maps with FULL objects as values
  vendorById: Record<Id, Vendor>;
  productById: Record<Id, Product>;
  userById: Record<Id, UserLite>;

  // status
  loaded: boolean;
  loading: boolean;
  error?: string;

  // actions
  load: () => Promise<void>;
  refresh: () => Promise<void>;
  clear: () => void;

  // getters (return FULL objects)
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
        if (s.loading || s.loaded) return;
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
          const msg = e instanceof Error ? e.message : 'Failed to load bootstrap data';
          set({ loading: false, error: msg });
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
          const msg = e instanceof Error ? e.message : 'Failed to refresh bootstrap data';
          set({ loading: false, error: msg });
        }
      },
    }),
    {
      name: 'bootstrap-cache',
      storage: createJSONStorage(() => localStorage), // persist full data
      version: 1, // bump this if you change shapes to force a reset
    }
  )
);
