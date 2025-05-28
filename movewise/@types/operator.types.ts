export interface Son {
    name: string;
    birth_date: string;
    gender: 'M' | 'F';
}

export interface ImageInfo {
    uri: string;
    name?: string;
    type?: string;
    width?: number;
    height?: number;
    fileSize?: number;
    exif?: any;
}

export interface FormData {
    //edit mod3
    id_operator?: number;
    // ─── step 1: General Data ──────────────────────────────────────
    first_name: string;
    last_name: string;
    birth_date: string;
    type_id: string;
    id_number: string;
    address: string;
    phone: string;
    email?: string;

    // ─── step 2: driven licence and childs ────────────────────────
    number_licence: string;
    zipcode?: string;
    has_minors: boolean;
    n_children: number;
    sons: Son[];

    // ─── step 3: end info ───────────────────────────────────
    code: string;
    salary: string;
    size_t_shift: string;
    name_t_shift: string;
    photo: ImageInfo | null;
    license_front: ImageInfo | null;
    license_back: ImageInfo | null;
    status: string;
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
    zipcode: string;
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
    id_number: string;
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
    quality?: number; // Calidad de la imagen (0.0 - 1.0)
    maxWidth?: number; // Ancho máximo para redimensionar
    maxHeight?: number; // Alto máximo para redimensionar
    aspect?: [number, number]; // Relación de aspecto para recorte [ancho, alto]
    allowsEditing?: boolean; // Permitir edición de imagen
}

// interface to CreateOperato
export interface CreateOperatorProps {
    isEditing?: boolean;
    initialData?: FormData;
    onClose: () => void;
    orderKey?: string; // Optional, only needed for new operator creation
}
