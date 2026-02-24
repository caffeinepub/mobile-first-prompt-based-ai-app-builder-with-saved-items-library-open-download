import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Item {
    id: string;
    content: string;
    owner: Principal;
    isShared: boolean;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createItem(id: string, content: string): Promise<void>;
    deleteItem(id: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getItem(id: string): Promise<Item | null>;
    getSharedItem(id: string): Promise<Item | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listUserItems(user: Principal): Promise<Array<Item>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    shareItem(id: string): Promise<void>;
    unshareItem(id: string): Promise<void>;
    updateItem(id: string, newContent: string): Promise<void>;
}
