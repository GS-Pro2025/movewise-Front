// Utilidad para obtener la fecha de hoy sin problemas de zona horaria
export const getTodayDate = (): Date => {
    const today = new Date();
    // Crear una nueva fecha usando los componentes locales para evitar problemas de zona horaria
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
};

// Utilidad para formatear fecha en formato YYYY-MM-DD sin conversión de zona horaria
export const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Ejemplo de uso:
/*
// En lugar de:
const [date, setDate] = useState(new Date());

// Usar:
const [date, setDate] = useState(getTodayDate());

// Y en lugar de:
date: date.toISOString().split('T')[0],

// Usar:
date: formatDateForAPI(date),
*/