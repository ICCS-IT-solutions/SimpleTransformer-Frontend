import { defineStore } from 'pinia';

/**
 * Minimal role stub so the UI can be built RBAC-ready before real auth lands.
 * - `role` is 'admin' | 'user'. Non-admin users may select configs but must
 *   not create/edit model or training configs.
 * - Enforcement must also happen server-side; this store only drives UI gating.
 */
export type AppRole = 'admin' | 'user';

type AuthStoreState = {
    role: AppRole;
};

const defaultState: AuthStoreState = {
    role: 'admin',
};

const authStore = defineStore('auth', {
    state: (): AuthStoreState => ({ ...defaultState }),
    getters: {
        isAdmin: (state): boolean => state.role === 'admin',
        /** Gate for creating/editing model + training configs. */
        canEditConfigs: (state): boolean => state.role === 'admin',
    },
    actions: {
        setRole(role: AppRole) {
            this.role = role;
        },
    },
});

export default authStore;
