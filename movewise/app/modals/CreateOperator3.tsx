  import React, { useState, useEffect } from 'react';
  import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
  } from 'react-native';
  import { useForm, Controller } from 'react-hook-form';
  import DropDownPicker from 'react-native-dropdown-picker';
  import { z } from 'zod';
  import { zodResolver } from '@hookform/resolvers/zod';
  import tw from 'twrnc'; 
  import { useColorScheme } from 'react-native';
  import { useRouter } from "expo-router";
  import * as ImagePicker from 'expo-image-picker';
  import { Image, Alert } from 'react-native'; // También necesitas esto para mostrar la imagen y alertas

  const schema = z.object({
    salary: z.coerce.number().int().min(1, 'El salario es requerido'),
    size: z.string().min(1, 'Tipo de identificación requerido'),
    nameShirt: z.string().min(1, 'Número de identificación requerido'),
  });

  type FormData = z.infer<typeof schema>;

  const CreateOperator3 = () => {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const router = useRouter();
    const {
      control,
      handleSubmit,
      setValue,
      formState: { errors },
    } = useForm<FormData>({
      resolver: zodResolver(schema),  
    });

    const [types, setTypes] = useState<{ label: string; value: string }[]>([]);

    const [typeOpen, setTypeOpen] = useState(false);

    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    useEffect(() => {
      setTypes([
        { label: 'Cédula', value: 'cc' },
        { label: 'Pasaporte', value: 'passport' },
      ]);
    }, []);
    
    const onSubmit = (data: FormData) => {
      console.log('Formulario:', data);
    };

    //Funcion para seleccionar imagen 
    const pickImage = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Necesitas permitir el acceso a la galería.');
        return;
      }
    
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4], // Proporción 3x4
        quality: 1,
      });
    
      if (!result.canceled) {
        setPhotoUri(result.assets[0].uri);
      }
    }  

    //Darkmode
    const styles = (isDarkMode: boolean) => ({
      container: [
        tw`flex-1 justify-center items-center`,
        { backgroundColor: isDarkMode ? '#112A4A' : '#FFFFFF' }
      ],
      modalBox: [
          tw`p-4 w-11/11 max-h-[85%]`,
          {
            backgroundColor: isDarkMode ? '#112A4A' : '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : '#D1D5DB', 
          }
        ],
      title: [
        tw`text-xl mt-[-80] font-bold mb-4`,
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
          color: '#EF4444', 
        },
        
    });
    
    const s = styles(isDarkMode);

    return (
      <>
        <View style={s.container}>
          <Text style={s.title}>Operator Registration</Text>
            <View style={s.modalBox}>
              <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.titleSection}>General Data</Text>
                
              <Text style={s.label}> Salary <Text style={s.requiredMark}>(*)</Text></Text>
              <Controller
                control={control}
                name="salary" 
                render={({ field: { onChange, value } }) => (
                  <TextInput style={[s.input, s.inputBorder]} placeholderTextColor="#9CA3AF" onChangeText={onChange} value={value?.toString() ?? ''} placeholder="0.0" 
                  />
                )}
              />
              {errors.salary && <Text style={tw`text-red-500`}>{errors.salary.message}</Text>}

              <Text style={s.label}> Size <Text style={s.requiredMark}>(*)</Text></Text>
              <Controller 
                control={control}
                name="size"
                render={({ field: { onChange, value } }) => (
                  <DropDownPicker
                    open={typeOpen}
                    setOpen={setTypeOpen}
                    value={value}
                    items={types}
                    setValue={onChange}
                    placeholder="Select Size" placeholderStyle={{ color: '#9CA3AF' }}
                    style={[s.input, s.inputBorder]}
                  />
                )}
              />
              {errors.size && <Text style={tw`text-red-500`}>{errors.size.message}</Text>}

              <Text style={s.label}>Name you want to wear on the T-shirt <Text style={s.requiredMark}>(*)</Text></Text>
              <Controller
                control={control}
                name="nameShirt"
                render={({ field: { onChange, value } }) => (
                  <TextInput style={[s.input, s.inputBorder]} placeholderTextColor="#9CA3AF" onChangeText={onChange} value={value} placeholder="100101010" />
                )}
              />
              {errors.nameShirt && <Text style={tw`text-red-500`}>{errors.nameShirt.message}</Text>}

              <Text style={s.label}>photo 3X4 <Text style={s.requiredMark}>(*)</Text></Text>

  <TouchableOpacity
    onPress={pickImage}
    style={{
      borderWidth: 1.5,
      borderColor: photoUri ? (isDarkMode ? '#9CA3AF' : '#0458AB') : '#EF4444',
      borderRadius: 10,
      padding: 10,
      alignItems: 'center',
      justifyContent: 'center',
      height: 150,
      width: 120,
      backgroundColor: isDarkMode ? '#FFFFFF36' : '#FFFFFF',
    }}
  >
    {photoUri ? (
      <Image source={{ uri: photoUri }} style={{ width: 100, height: 133, borderRadius: 5 }} />
    ) : (
      <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Seleccionar imagen</Text>
    )}
  </TouchableOpacity>
  {errors.nameShirt && <Text style={tw`text-red-500`}>{errors.nameShirt.message}</Text>}

  

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
          </View>
      </>
    );
    
  };

  export default CreateOperator3;
