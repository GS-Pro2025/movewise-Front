import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

interface SettingsModalProps {
    visible: boolean;
    onClose: () => void;
    onOpenJobsModal: () => void;
    onOpenCustomerListModal: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose, onOpenJobsModal, onOpenCustomerListModal }) => {
    const { t } = useTranslation();

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>{t("settings")}</Text>
                    </View>
                    {/* Opciones de configuración */}
                    <TouchableOpacity
                        style={styles.modalOption}
                        onPress={() => {
                            onClose();
                            onOpenJobsModal();
                        }}
                    >
                        <Text style={styles.modalOptionText}>{t("option_jobs_and_tools")}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.modalOption}
                        onPress={() => {
                            onClose();
                            onOpenCustomerListModal();
                        }}
                    >
                        <Text style={styles.modalOptionText}>{t("customer_factory_option")}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.modalOption} onPress={onClose}>
                        <Text style={[styles.modalOptionText, styles.closeButtonText]}>{t("close")}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        width: "80%",
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        alignItems: "center",
    },
    header: {
        width: "100%",
        paddingBottom: 15,
        marginBottom: 15,
        borderBottomWidth: 2,
        borderBottomColor: "#0458AB",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#0458AB",
    },
    modalOption: {
        paddingVertical: 15,
        width: "100%",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    modalOptionText: {
        fontSize: 18,
        color: "#333",
    },
    closeButtonText: {
        color: "#e74c3c", 
    },
});

export default SettingsModal;