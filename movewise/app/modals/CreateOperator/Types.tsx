export interface FormData {
    // Step 1 - General Data
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    identificationType: string;
    identificationNumber: string;
    address: string;
    cellPhone: string;
    email: string;
  
    // Step 2 - Driving License
    drivingLicenseNumber: string;
    code: string;
    hasMinors: boolean;
    minorCount: number;
    sons: Son[];
  
    // Step 3 - Final Info
    salary: string;
    size: string;
    tshirtName: string;
    photo: ImageInfo | null;
    licenseFront: ImageInfo | null;
    licenseBack: ImageInfo | null;
    status: string;
  }

export interface Son {
    name: string;
    birth_date: string;
    gender: string;
}

// Type for image data
export interface ImageInfo {
    uri: string;
    name?: string;
    type?: string;
}

// Props for step components
export interface StepProps {
    formData: FormData;
    updateFormData: (data: Partial<FormData>) => void;
    onNext?: () => void;
    onBack?: () => void;
    onSubmit?: () => void;
    isEditing: boolean;
}

export interface Operator {
    id_operator: number;
    number_licence: string;
    code: string;
    n_children: number;
    size_t_shift: string;
    name_t_shift: string;
    salary: string;
    photo: string;
    license_front: string;
    license_back: string;
    status: string;
    first_name: string;
    last_name: string;
    birth_date: string;
    type_id: string;
    id_number: number;
    address: string;
    phone: string;
    email: string;
    sons: Son[];
}

// Props for form input components
export interface FormInputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
    error?: string;
    required?: boolean;
}

export interface DateInputProps {
    label: string;
    value: string;
    onChangeDate: (date: string) => void;
    error?: string;
    required?: boolean;
}

export interface DropdownInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    error?: string;
    required?: boolean;
}

export interface RadioOption {
    label: string;
    value: boolean;
}

export interface RadioGroupProps {
    label: string;
    options: RadioOption[];
    selectedValue: boolean;
    onSelect: (value: boolean) => void;
    error?: string;
    required?: boolean;
}

export interface ImageUploadProps {
    label: string;
    image: ImageInfo | null;
    onImageSelected: (image: ImageInfo) => void;
    error?: string;
    required?: boolean;
}

// interface to CreateOperato
export interface CreateOperatorProps {
    isEditing?: boolean;
    initialData?: FormData; // Asegúrate de que 'FormData' esté definido o crea tu propia interfaz
    onClose: () => void;
  }
  