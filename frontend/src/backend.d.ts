import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
}
export interface AppCreation {
    id: string;
    content: string;
    owner: Principal;
    isShared: boolean;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteAppCreation(id: string): Promise<void>;
    generateAppCreation(id: string, content: string): Promise<void>;
    getAppCreation(id: string): Promise<AppCreation | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getSharedAppCreation(id: string): Promise<AppCreation | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listUserAppCreations(user: Principal): Promise<Array<AppCreation>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    shareAppCreation(id: string): Promise<void>;
    unshareAppCreation(id: string): Promise<void>;
    updateAppCreation(id: string, newContent: string): Promise<void>;
}
