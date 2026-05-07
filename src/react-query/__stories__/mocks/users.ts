export type MockUserRole = 'admin' | 'editor' | 'viewer';

export interface MockUser {
    id: number;
    name: string;
    email: string;
    role: MockUserRole;
    department: string;
}

export const MOCK_USERS: MockUser[] = [
    {
        id: 1,
        name: 'Alice Karim',
        email: 'alice@example.com',
        role: 'admin',
        department: 'Engineering',
    },
    {id: 2, name: 'Bob Tanner', email: 'bob@example.com', role: 'editor', department: 'Design'},
    {
        id: 3,
        name: 'Carol Shen',
        email: 'carol@example.com',
        role: 'viewer',
        department: 'Marketing',
    },
    {
        id: 4,
        name: 'Dan Okafor',
        email: 'dan@example.com',
        role: 'editor',
        department: 'Engineering',
    },
    {id: 5, name: 'Eve Novak', email: 'eve@example.com', role: 'viewer', department: 'Sales'},
];
