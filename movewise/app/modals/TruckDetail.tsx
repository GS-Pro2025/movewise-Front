import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Modal,
    SafeAreaView,
    ScrollView,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';

interface Errors {
    name?: string;
    costFuel?: string;
    costPerGL?: string;
    fuelQty?: string;
    initialOdometer?: string;
    finalOdometer?: string;
    distance?: string;
}

// TruckDetailModal component
const TruckDetailModal: React.FC<Props> = ({ visible, onClose }) => {
    const [errors, setErrors] = useState<Errors>({});
    const [name, setName] = useState("");
    const [costFuel, setCostFuel] = useState("");
    const [costPerGL, setCostPerGL] = useState("");
    const [fuelQty, setFuelQty] = useState("");
    const [initialOdometer, setInitialOdometer] = useState("");
    const [finalOdometer, setFinalOdometer] = useState("");
    const [distance, setDistance] = useState("");

    // Validate individual field
    const validateField = (name: keyof Errors, value: string) => {
        let error = "";
        
        switch(name) {
            case 'name':
                if (!value.trim()) error = 'Name is required';
                break;
            case 'costFuel':
                if (!value) error = 'Fuel cost is required';
                else if (!/^\d+(\.\d{1,2})?$/.test(value)) error = 'Invalid currency format';
                break;
            case 'costPerGL':
                if (!value) error = 'Cost per GL is required';
                else if (parseFloat(value) <= 0) error = 'Must be greater than 0';
                break;
            case 'fuelQty':
                if (!value) error = 'Fuel quantity is required';
                else if (parseFloat(value) <= 0) error = 'Must be greater than 0';
                break;
            case 'initialOdometer':
                if (!value) error = 'Initial odometer is required';
                else if (parseFloat(value) < 0) error = 'Cannot be negative';
                break;
            case 'finalOdometer':
                if (!value) error = 'Final odometer is required';
                else if (parseFloat(value) < parseFloat(initialOdometer)) {
                    error = 'Must be greater than the initial odometer';
                }
                break;
        }
        
        setErrors(prev => ({ ...prev, [name]: error }));
        return !error;
    };

    // Validate the entire form
    const validateForm = () => {
        const fields = [
            { name: 'name', value: name },
            { name: 'costFuel', value: costFuel },
            { name: 'costPerGL', value: costPerGL },
            { name: 'fuelQty', value: fuelQty },
            { name: 'initialOdometer', value: initialOdometer },
            { name: 'finalOdometer', value: finalOdometer },
        ];

        return fields.every(field => validateField(field.name as keyof Errors, field.value));
    };

    // Handle save action
    const handleSave = () => {
        if (!validateForm()) return;

        const calculatedDistance = parseFloat(finalOdometer) - parseFloat(initialOdometer);
        setDistance(calculatedDistance.toString());

        const dataToSend = {
            name,
            costFuel: parseFloat(costFuel),
            costPerGL: parseFloat(costPerGL),
            fuelQty: parseFloat(fuelQty),
            initialOdometer: parseFloat(initialOdometer),
            finalOdometer: parseFloat(finalOdometer),
            distance: calculatedDistance,
        };
        
        console.log(dataToSend);
        onClose();
    };

    useEffect(() => {
        if (initialOdometer && finalOdometer) {
            const initial = parseFloat(initialOdometer);
            const final = parseFloat(finalOdometer);
            if (!isNaN(initial) && !isNaN(final) && final >= initial) {
                setDistance((final - initial).toString());
            }
        }
    }, [initialOdometer, finalOdometer]);

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <SafeAreaView style={styles.container}>
                <ScrollView>
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Truck Reference</Text>
                        <View style={styles.headerRight} />
                    </View>

                    <View style={styles.content}>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Name (*)</Text>
                            <TextInput
                                style={[styles.input, errors.name && styles.inputError]}
                                value={name}
                                onChangeText={text => {
                                    setName(text);
                                    validateField('name', text);
                                }}
                                placeholder="Enter name"
                                placeholderTextColor="#999"
                            />
                            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Fuel Cost (USD) (*)</Text>
                            <TextInput
                                style={[styles.input, errors.costFuel && styles.inputError]}
                                value={costFuel}
                                onChangeText={text => {
                                    setCostFuel(text);
                                    validateField('costFuel', text);
                                }}
                                keyboardType="numeric"
                                placeholder="Enter fuel cost"
                                placeholderTextColor="#999"
                            />
                            {errors.costFuel && <Text style={styles.errorText}>{errors.costFuel}</Text>}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Cost (USD/GL) (*)</Text>
                            <TextInput
                                style={[styles.input, errors.costPerGL && styles.inputError]}
                                value={costPerGL}
                                onChangeText={text => {
                                    setCostPerGL(text);
                                    validateField('costPerGL', text);
                                }}
                                keyboardType="numeric"
                                placeholder="Enter cost per GL"
                                placeholderTextColor="#999"
                            />
                            {errors.costPerGL && <Text style={styles.errorText}>{errors.costPerGL}</Text>}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Fuel Quantity (GL) (*)</Text>
                            <TextInput
                                style={[styles.input, errors.fuelQty && styles.inputError]}
                                value={fuelQty}
                                onChangeText={text => {
                                    setFuelQty(text);
                                    validateField('fuelQty', text);
                                }}
                                keyboardType="numeric"
                                placeholder="Enter fuel quantity"
                                placeholderTextColor="#999"
                            />
                            {errors.fuelQty && <Text style={styles.errorText}>{errors.fuelQty}</Text>}
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.formGroup, styles.halfWidth]}>
                                <Text style={styles.label}>Initial Odometer (ml) (*)</Text>
                                <TextInput
                                    style={[styles.input, errors.initialOdometer && styles.inputError]}
                                    value={initialOdometer}
                                    onChangeText={text => {
                                        setInitialOdometer(text);
                                        validateField('initialOdometer', text);
                                    }}
                                    keyboardType="numeric"
                                    placeholder="Enter initial odometer"
                                    placeholderTextColor="#999"
                                />
                                {errors.initialOdometer && <Text style={styles.errorText}>{errors.initialOdometer}</Text>}
                            </View>
                            <View style={[styles.formGroup, styles.halfWidth]}>
                                <Text style={styles.label}>Final Odometer (ml) (*)</Text>
                                <TextInput
                                    style={[styles.input, errors.finalOdometer && styles.inputError]}
                                    value={finalOdometer}
                                    onChangeText={text => {
                                        setFinalOdometer(text);
                                        validateField('finalOdometer', text);
                                    }}
                                    keyboardType="numeric"
                                    placeholder="Enter final odometer"
                                    placeholderTextColor="#999"
                                />
                                {errors.finalOdometer && <Text style={styles.errorText}>{errors.finalOdometer}</Text>}
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Distance (ml) (*)</Text>
                            <TextInput
                                style={styles.input}
                                value={String(parseFloat(finalOdometer) - parseFloat(initialOdometer))}
                                editable={false}
                                placeholder="0.0"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={onClose}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.saveButton]}
                                onPress={handleSave}
                            >
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View> 
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        backgroundColor: '#0458AB',
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    formGroup: {
        marginBottom: 15,
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
        fontSize: 14,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
        height: 40,
        fontSize: 14,
        backgroundColor: '#FFFFFF',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfWidth: {
        width: '48%',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 20,
        width: '48%',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#0458AB',
    },
    saveButton: {
        backgroundColor: '#0458AB',
    },
    cancelButtonText: {
        color: '#0458AB',
        fontWeight: 'bold',
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    closeButton: {
        marginRight: 10,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    headerRight: {
        width: 24,
    },
    inputError: {
        borderColor: '#E74C3C',
        backgroundColor: '#FDEDEC',
    },
    errorText: {
        color: '#E74C3C',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
});

export default TruckDetailModal;