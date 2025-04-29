import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router'; // Cambia a useLocalSearchParams
import { getSummary } from '../../hooks/api/SumaryClient'; // Ajusta la ruta según sea necesario

interface Summary {
  expense: string;
  rentingCost: string;
  fuelCost: string;
  workCost: string;
  driverSalaries: string;
  otherSalaries: string;
  totalCost: string;
}


const SummaryCostCard: React.FC= ({}) => {
  const { order, key_ref, customerFName, customerLName } = useLocalSearchParams(); // Usa useLocalSearchParams para obtener 'order'
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Obtiene los datos del resumen cuando cambia la orden
  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
  
      try {
        if (!order) {
          throw new Error("Order reference is missing.");
        }
  
        const response = await getSummary(order as string);
        console.log("API Response:", response);
  
        // Accede a los datos dentro de la propiedad `data`
        const data = response.data;
  
        // Actualiza el estado con los datos de la API
        setSummary({
          expense: data.expense,
          rentingCost: data.rentingCost,
          fuelCost: data.fuelCost,
          workCost: data.workCost,
          driverSalaries: data.driverSalaries,
          otherSalaries: data.otherSalaries,
          totalCost: data.totalCost,
        });
      } catch (err) {
        console.error("Error fetching summary:", err);
        setError("Failed to load summary data.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchSummary();
  }, [order]);
  
  // Observa los cambios en el estado summary
  useEffect(() => {
    console.log("Updated summary:", summary);
  }, [summary]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0047AB" />
        <Text>Loading summary...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={styles.container}>
        <Text>No summary data available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Summary</Text>

      <Text style={styles.label}>
        <Text style={styles.bold}>Order:</Text> {key_ref}
      </Text>

      <Text style={styles.label}>
        <Text style={styles.bold}>Customer Name:</Text> {customerFName.toString() + " " + customerLName.toString()}
      </Text>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={[styles.tableHeader, styles.flex1]}>Details</Text>
          <Text style={[styles.tableHeader, styles.flex1]}>Value</Text>
        </View>

        {/* Renderiza los detalles del resumen */}
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.flex1]}>Expense</Text>
          <Text style={[styles.tableCell, styles.flex1]}>{summary?.expense || "N/A"}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.flex1]}>Renting Cost</Text>
          <Text style={[styles.tableCell, styles.flex1]}>{summary?.rentingCost || "N/A"}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.flex1]}>Fuel Cost</Text>
          <Text style={[styles.tableCell, styles.flex1]}>{summary?.fuelCost || "N/A"}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.flex1]}>Work Cost</Text>
          <Text style={[styles.tableCell, styles.flex1]}>{summary?.workCost || "N/A"}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.flex1]}>Driver Salaries</Text>
          <Text style={[styles.tableCell, styles.flex1]}>{summary?.driverSalaries || "N/A"}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.flex1]}>Operators</Text>
          <Text style={[styles.tableCell, styles.flex1]}>{summary?.otherSalaries || "N/A"}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableHeader, styles.flex1]}>Total Cost</Text>
          <Text style={[styles.tableHeader, styles.flex1]}>{summary?.totalCost || "N/A"}</Text>
        </View>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back to Orders</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

export default SummaryCostCard;

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    padding: 24,
    backgroundColor: '#fff',
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0047AB',
    marginBottom: 12,
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 14,
    color: '#0047AB',
    marginVertical: 2,
  },
  bold: {
    fontWeight: 'bold',
  },
  table: {
    width: '100%',
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#0052CC',
    color: '#fff',
    padding: 12,
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  tableCell: {
    backgroundColor: '#E8E8E8',
    color: '#333',
    padding: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  flex1: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#001F8A',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 24,
    elevation: 3,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#FF5733',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 24,
    elevation: 3,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});