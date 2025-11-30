import type { FirebaseApp } from 'firebase/app';
import type { Auth, Persistence } from 'firebase/auth';

type AsyncStorageLike = {
	getItem(key: string): Promise<string | null>;
	setItem(key: string, value: string): Promise<void>;
	removeItem(key: string): Promise<void>;
};

declare module 'firebase/auth' {
	export function initializeAuth(app: FirebaseApp, deps: { persistence: Persistence | Persistence[] }): Auth;
	export function getReactNativePersistence(storage: AsyncStorageLike): Persistence;
}
