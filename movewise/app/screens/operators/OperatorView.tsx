import React, { useState, useCallback } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import {
    View, Text, StyleSheet, TouchableOpacity,
    useColorScheme, SafeAreaView, Platform
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import BaseOperatorView, { Assignment } from "../../../components/operator/BaseOperator";
import AssignmentItem from "../../../components/operator/AssignmentItem";
import AssignmentDetails from '../orders/assignmentDetails';
import TruckDetail from '../trucks/TruckDetail';
const OperatorView = () => {
    const { t } = useTranslation(); // Hook para traducción
    const params = useLocalSearchParams();
    const router = useRouter();
    const type = params.type as string;
    const operatorId = params.operatorId as string;

    const [selectedDate, setSelectedDate] = useState(new Date());
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    const [modalVisible, setModalVisible] = useState(false);
    const [selected, setSelected] = useState<Assignment | null>(null);
    const isTruckView = type === 'truck';
    const filterRole  = isTruckView
        ? (role: string) => role.toLowerCase() === 'driver'
        : (role: string) => role.toLowerCase() !== 'driver' && !role.toLowerCase().includes('driver');
    const emptyMessage = isTruckView
        ? t("no_truck_assignments_available")
        : t("no_work_assignments_available");
    const screenTitle = isTruckView ? t("truck_daily") : t("work_daily");

    const handleAssignmentPress = useCallback((item: Assignment) => {
        setSelected(item);
        setModalVisible(true);
    }, []);

    const handleClose = () => {
        setModalVisible(false);
        setSelected(null);
    };

    return (
        <SafeAreaView style={[
            styles.container,
            { backgroundColor: isDarkMode ? '#112A4A' : '#FFFFFF' }
        ]}>
            {/* Encabezado */}
            <View style={[
                styles.header,
                { backgroundColor: isDarkMode ? '#0A1C30' : '#0458AB' },
                Platform.OS === 'ios' ? styles.iosHeader : {}
            ]}>
                <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { marginLeft: 10 }]}>{screenTitle}</Text>
            </View>

            {/* Lista de asignaciones */}

            <BaseOperatorView
                isDarkMode={isDarkMode}
                filterRole={filterRole}
                emptyMessage={emptyMessage}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                operatorId={operatorId}
                isTruckView={isTruckView}
                renderItem={({ item }) => (
                    <AssignmentItem
                        item={item}
                        showRole={!isTruckView}
                        onPress={handleAssignmentPress}
                        isDarkMode={isDarkMode}
                    />
                )}
            />

            {/* Renderizar el modal */}
            {selected && (
                isTruckView ? (
                    <TruckDetail
                        visible={modalVisible}
                        onClose={handleClose}
                        assignment={selected}
                    />
                ) : (
                    <AssignmentDetails
                        visible={modalVisible}
                        onClose={handleClose}
                        assignment={selected}
                        operatorId={operatorId}
                        type={type}
                    />
                )
            )}
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    iosHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingVertical: 20,
        paddingHorizontal: 10,
        elevation: 4,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingVertical: 20,
        paddingHorizontal: 10,
        elevation: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    closeButton: {
        padding: 5,
    },
    headerRight: {
        width: 30, // Same width as close button for balance
    }
});

export default OperatorView;