export interface ModelAddTruck {
    number_truck: string;
    type: string;
    rol: string;
    name: string;
  }
  
  /**
   * Crea el objeto que será enviado al backend.
   * @param number_truck - Número del camión
   * @param type - Tipo de camión
   * @param rol - Rol asignado
   * @param name - Nombre del camión
   * @returns Objeto Truck listo para enviar
   */
  export function createTruckPayload(
    number_truck: string,
    type: string,
    rol: string,
    name: string
  ): ModelAddTruck {
    return {
      number_truck,
      type,
      rol,
      name,
    };
  }
  