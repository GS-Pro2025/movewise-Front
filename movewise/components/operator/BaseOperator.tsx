// components/operator/BaseOperatorView.tsx
import { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ActivityIndicator, FlatList, RefreshControl } from "react-native";
import { getWorkDailyByOperator } from "../../hooks/api/GetWorkDailyByOperator";
import EmptyList from "./EmptyList";
import DateSelector from "./DateSelector";

export interface Person {
    first_name: string;
    last_name: string;
    email: string;
}

export interface DataOrder {
    key: string;
    key_ref: string;
    date: string;
    distance: number | null;
    expense: string | null;
    income: string | null;
    weight: string;
    status: string;
    payStatus: number | null;
    evidence: string | null;
    state_usa: string;
    id_company: number | null;
    person: Person;
    job: number;
    assign: number[];
    tool: number[];
}

export interface Assignment {
    id: number;
    operator: number;
    order: string;
    data_order: DataOrder;
    truck: string | null;
    payment: string | null;
    assigned_at: string;
    rol: string | null;
    audit_records: any[];
    additional_costs: string | null;
}

export interface ApiResponse {
    status: string;
    messDev: string;
    messUser: string;
    data: Assignment[];
}

interface BaseOperatorViewProps {
    filterRole: ((role: string) => boolean) | null;
    renderItem: ({ item }: { item: Assignment }) => React.ReactElement;
    emptyMessage: string;
    isDarkMode: boolean;
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    operatorId: string | number;
    isTruckView: boolean;
}

const BaseOperatorView: React.FC<BaseOperatorViewProps> = ({
    filterRole,
    renderItem,
    emptyMessage,
    isDarkMode,
    selectedDate,
    setSelectedDate,
    operatorId,
    isTruckView
}) => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Format date for comparison (YYYY-MM-DD)
    const formatDateForComparison = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const loadAssignments = useCallback(async () => {
        console.log("Loading assignments for operator:", operatorId);

        if (!operatorId) {
            console.error("No operator ID provided");
            setLoading(false);
            setRefreshing(false);
            return;
        }

        setLoading(true);
        try {
            const response = await getWorkDailyByOperator(operatorId.toString());
            console.log("API response:", response);

            if (response?.status === "success") {
                console.log(`guardado en el estado: ${JSON.stringify(response.data)}`);
                
                setAssignments(response.data || []);
            } else {
                console.error("API error:", response?.message);
            }
        } catch (error) {
            console.error("Error loading assignments:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [operatorId]);

    useEffect(() => {
        const filtered = assignments.filter(({ data_order, rol }) => {
            const dateMatches =
                data_order.date === formatDateForComparison(selectedDate);
            //normalize the role to lowercase
            const roleNormalized = rol?.toLowerCase().trim();
            const isDriver = roleNormalized === 'driver';
            //exclude drivers if isTruckView is true
            const roleMatches = isTruckView ? isDriver : !isDriver;

            return dateMatches && roleMatches;
        });

        setFilteredAssignments(filtered);
    }, [assignments, selectedDate, isTruckView]);


    useEffect(() => {
        loadAssignments();
    }, [loadAssignments]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadAssignments();
    }, [loadAssignments]);

    if (loading) {
        return <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0458AB" />
        </View>;
    }

    return (
        <View style={styles.container}>
            <DateSelector
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                isDarkMode={isDarkMode}
            />

            <FlatList
                data={filteredAssignments}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#0458AB"]}
                    />
                }
                ListEmptyComponent={
                    <EmptyList
                        message={emptyMessage}
                        date={selectedDate}
                        isDarkMode={isDarkMode}
                    />
                }
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    listContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    }
});

export default BaseOperatorView;