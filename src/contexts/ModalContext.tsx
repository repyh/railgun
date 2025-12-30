import { createContext, useContext, useState, type ReactNode } from 'react';

export type ModalType = 'create-project' | 'open-project' | 'settings-appearance' | 'about' | 'toggle-console' | null;

interface ModalContextType {
    activeModal: ModalType;
    openModal: (type: ModalType) => void;
    closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const [activeModal, setActiveModal] = useState<ModalType>(null);

    const openModal = (type: ModalType) => setActiveModal(type);
    const closeModal = () => setActiveModal(null);

    return (
        <ModalContext.Provider value={{ activeModal, openModal, closeModal }}>
            {children}
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};
