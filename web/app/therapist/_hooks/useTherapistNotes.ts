export const useTherapistNotes = (patientId: string) => {
    return {
        notes: [],
        isLoading: false,
        addNote: async (note: any) => { },
        updateNote: async (id: string, updates: any) => { },
        deleteNote: async (id: string) => { }
    };
};
