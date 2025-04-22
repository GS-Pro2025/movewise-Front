// app/models/extraCost.ts

export interface ModelAddExtraCost {
    name: string;
    cost: number;
    type: string;
    id_order: string;
  }
  
  /**
   * Crea el objeto que será enviado al backend.
   * @param name - Nombre del costo extra
   * @param cost - Monto del costo
   * @param type - Tipo de costo
   * @param id_order - ID de la orden asociada
   * @returns Objeto con la forma esperada por el backend
   */
  export function createExtraCostPayload(
    name: string,
    cost: number,
    type: string,
    id_order: string
  ): ModelAddExtraCost {
    return {
      name,
      cost,
      type,
      id_order,
    };
  }
  