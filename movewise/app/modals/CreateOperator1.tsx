import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import tw from 'twrnc';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';


const schema = z.object({
  first_name: z.string().min(1, 'El nombre es requerido'),
  last_name: z.string().min(1, 'El apellido es requerido'),
  date: z.date(),
  identification_type: z.string().min(1, 'Tipo de identificación requerido'),
  id_number: z.string().min(1, 'Número de identificación requerido'),
  state: z.string().min(1, 'Estado requerido'),
  city: z.string().min(1, 'Ciudad requerida'),
  zip_code: z.string().min(1, 'Código postal requerido'),
  address: z.string().min(1, 'Dirección requerida'),
  phone: z.string().min(1, 'Celular requerido'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  visible: boolean;
  onClose: () => void;
}

const CreateOperator1 = () => {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date(), // ⬅️ Valor inicial para que el form lo registre
    },
  });


  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [types, setTypes] = useState<{ label: string; value: string }[]>([]);
  const [states, setStates] = useState<{ label: string; value: string }[]>([]);
  const [cities, setCities] = useState<{ label: string; value: string }[]>([]);

  const [typeOpen, setTypeOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  useEffect(() => {
    setTypes([
      { label: 'Cédula', value: 'cc' },
      { label: 'Pasaporte', value: 'passport' },
    ]);
    setStates([
      { label: 'Cauca', value: 'cauca' },
      { label: 'Valle del Cauca', value: 'valle' },
    ]);
    setCities([
      { label: 'Popayán', value: 'popayan' },
      { label: 'Cali', value: 'cali' },
    ]);
  }, []);

  const handleConfirm = (selectedDate: Date) => {
    setDate(selectedDate);
    setValue('date', selectedDate);
    setShowDatePicker(false);
  };

  const onSubmit = (data: FormData) => {
    console.log('Formulario:', data);
    console.log('Voy a redirigir a CreateOperator3');
    router.push('/modals/CreateOperator3');
  };

  //Darkmode
  const styles = (isDarkMode: boolean) => ({
    container: [
      tw`flex-1 justify-center items-center`,
      { backgroundColor: isDarkMode ? '#112A4A' : '#FFFFFF' }
    ],
    modalBox: [
      tw`p-4 w-11/11 max-h-[100%]`,
      {
        backgroundColor: isDarkMode ? '#112A4A' : '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : '#D1D5DB',
      }
    ],
    title: [
      tw`text-xl mt-20 font-bold mb-4`,
      { color: isDarkMode ? '#FFFFFF' : '#0458AB' }
    ],
    titleSection: [
      tw`text-xl font-bold mb-4 mt-15`,
      { color: isDarkMode ? '#FFFFFF' : '#0458AB' }
    ],
    label: [
      tw`mb-1`,
      { color: isDarkMode ? '#FFFFFF' : '#0458AB' }
    ],
    input: [
      tw`border p-2 mb-2 rounded-2`,
      {
        backgroundColor: isDarkMode ? '#FFFFFF36' : '#FFFFFF',
        color: isDarkMode ? '#9CA3AF' : '#000000',
        borderColor: isDarkMode ? '#9CA3AF' : '#D1D5DB'
      }
    ],
    inputBorder: {
      borderWidth: 1.5,
      borderColor: isDarkMode ? '#64748b' : '#0458AB'
    },
    errorText: {
      color: '#EF4444',
      marginBottom: 4
    },
    placeholder: {
      color: '#9CA3AF'
    },
    requiredMark: {
      color: '#EF4444', // rojo tailwind
    },
  });

  const s = styles(isDarkMode);

  return (
    <>
      <View style={s.container}>
        <Text style={s.title}>Operator Registration</Text>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >

          <View style={s.modalBox}>



            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.titleSection}>General Data</Text>

              {errors.first_name && <Text style={tw`text-red-500`}>{errors.first_name.message}</Text>}
              <Text style={s.label}> First Name <Text style={s.requiredMark}>(*)</Text></Text>
              <Controller
                control={control}
                name="first_name"
                render={({ field: { onChange, value } }) => (
                  <TextInput style={[s.input, s.inputBorder]} placeholderTextColor="#9CA3AF" onChangeText={onChange} value={value} placeholder="First Name" />
                )}
              />

              {errors.last_name && <Text style={tw`text-red-500`}>{errors.last_name.message}</Text>}
              <Text style={s.label}> Last Name <Text style={s.requiredMark}>(*)</Text></Text>
              <Controller
                control={control}
                name="last_name"
                render={({ field: { onChange, value } }) => (
                  <TextInput style={[s.input, s.inputBorder]} placeholderTextColor="#9CA3AF" onChangeText={onChange} value={value} placeholder="Last Name" />
                )}
              />

              {errors.date && <Text style={tw`text-red-500`}>{errors.date.message}</Text>}
              <Text style={s.label}> Date of birth <Text style={s.requiredMark}>(*)</Text></Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[s.input, s.inputBorder]} >
                <Text style={{ color: isDarkMode ? '#9CA3AF' : '#9CA3AF' }}>
                  {date.toLocaleDateString()}
                </Text>
              </TouchableOpacity>

              <Text style={s.label}> Identification type <Text style={s.requiredMark}>(*)</Text></Text>
              <Controller
                control={control}
                name="identification_type"
                render={({ field: { onChange, value } }) => (
                  <DropDownPicker
                    open={typeOpen}
                    setOpen={setTypeOpen}
                    value={value}
                    items={types}
                    setValue={onChange}
                    placeholder="Select Type" placeholderStyle={{ color: '#9CA3AF' }}
                    style={[s.input, s.inputBorder]}
                  />
                )}
              />

              <Text style={s.label}> Id number <Text style={s.requiredMark}>(*)</Text></Text>
              <Controller
                control={control}
                name="id_number"
                render={({ field: { onChange, value } }) => (
                  <TextInput style={[s.input, s.inputBorder]} placeholderTextColor="#9CA3AF" onChangeText={onChange} value={value} placeholder="100101010" />
                )}
              />
              {errors.id_number && <Text style={tw`text-red-500`}>{errors.id_number.message}</Text>}

              <Text style={s.label}> State <Text style={s.requiredMark}>(*)</Text></Text>
              <Controller
                control={control}
                name="state"
                render={({ field: { onChange, value } }) => (
                  <DropDownPicker
                    open={stateOpen}
                    setOpen={setStateOpen}
                    value={value}
                    items={states}
                    setValue={onChange}
                    placeholder="Select State" placeholderStyle={{ color: '#9CA3AF' }}
                    style={[s.input, s.inputBorder]}
                  />
                )}
              />
              {errors.state && <Text style={tw`text-red-500`}>{errors.state.message}</Text>}

              <Text style={s.label}> City <Text style={s.requiredMark}>(*)</Text></Text>
              <Controller
                control={control}
                name="city"
                render={({ field: { onChange, value } }) => (
                  <DropDownPicker
                    open={cityOpen}
                    setOpen={setCityOpen}
                    value={value}
                    items={cities}
                    setValue={onChange}
                    placeholder="Select City" placeholderStyle={{ color: '#9CA3AF' }}
                    style={[s.input, s.inputBorder]}
                  />
                )}
              />
              {errors.city && <Text style={tw`text-red-500`}>{errors.city.message}</Text>}

              <Text style={s.label}> Zip code <Text style={s.requiredMark}>(*)</Text></Text>
              <Controller
                control={control}
                name="zip_code"
                render={({ field: { onChange, value } }) => (
                  <TextInput style={[s.input, s.inputBorder]} placeholderTextColor="#9CA3AF" onChangeText={onChange} value={value} placeholder="0090" />
                )}
              />
              {errors.zip_code && <Text style={tw`text-red-500`}>{errors.zip_code.message}</Text>}

              <Text style={s.label}> Address <Text style={s.requiredMark}>(*)</Text></Text>
              <Controller
                control={control}
                name="address"
                render={({ field: { onChange, value } }) => (
                  <TextInput style={[s.input, s.inputBorder]} placeholderTextColor="#9CA3AF" onChangeText={onChange} value={value} placeholder="Address" />
                )}
              />
              {errors.address && <Text style={tw`text-red-500`}>{errors.address.message}</Text>}

              <Text style={s.label}> Cell phone <Text style={s.requiredMark}>(*)</Text></Text>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    onChangeText={onChange}
                    value={value}
                    placeholder="+1 0231923"
                    keyboardType="phone-pad"
                    style={[s.input, s.inputBorder]} placeholderTextColor="#9CA3AF"
                  />
                )}
              />
              {errors.phone && <Text style={tw`text-red-500`}>{errors.phone.message}</Text>}

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 16,
                  gap: 50,
                }}
              >
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={{
                    backgroundColor: isDarkMode ? '#6B7280' : '#4B4B4B',
                    paddingVertical: 12,
                    paddingHorizontal: 36,
                    borderRadius: 15,
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSubmit(onSubmit)}
                  style={{
                    backgroundColor: isDarkMode ? '#3B82F6' : '#60A5FA',
                    paddingVertical: 12,
                    paddingHorizontal: 36,
                    borderRadius: 15,
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                    Next
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={() => setShowDatePicker(false)}
        date={date}
      />
    </>
  );

};

export default CreateOperator1;
