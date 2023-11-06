// Estrutura do usuário (banco de dados)
export interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface UserToCreate {
    name: string;
    email: string;
    phone: string;
}

// Semantic UI Reducer State (Modal)
export interface ReducerModalState {
    open: boolean;
    size?: "small" | "mini" | "tiny" | "large" | "fullscreen" | undefined
    dimmer?: "inverted" | "blurring" | undefined;
    userToRemove?: User | null;
    userToEdit?: Partial<User> | null;
    userToCreate?: Partial<UserToCreate> | null;
}

// Semantic UI Reducer Action (Modal)
export interface ReducerModalAction {
    type: string;
    size?: "small" | "mini" | "tiny" | "large" | "fullscreen" | undefined
    dimmer?: "inverted" | "blurring" | undefined;
    userToRemove?: User | null;
    userToEdit?: Partial<User> | null;
    userToCreate?: Partial<UserToCreate> | null;
}