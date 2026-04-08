// Gunakan localStorage sebagai ganti Firestore

export const fetchUsers = async () => {
    const data = localStorage.getItem("users");
    if (!data) return [];
    try {
        return JSON.parse(data);
    } catch {
        return [];
    }
};

export const addUser = async (userObj) => {
    const users = await fetchUsers();
    const newUser = { id: Date.now().toString(), ...userObj };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    return newUser;
};

export const updateUserStats = async (userId, xp, analytics, level) => {
    const users = await fetchUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
        users[index].xp = xp;
        users[index].analytics = analytics;
        users[index].level = level;
        localStorage.setItem("users", JSON.stringify(users));
    }
};

export const addSessionHistory = async (userId, sessionData) => {
    const users = await fetchUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
        if (!users[index].history) {
            users[index].history = [];
        }
        users[index].history.push(sessionData);
        localStorage.setItem("users", JSON.stringify(users));
    }
};
