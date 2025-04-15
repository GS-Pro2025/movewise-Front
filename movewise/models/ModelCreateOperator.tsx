export interface CreateOperator {
  first_name: string;
  last_name: string;
  birth_date: Date; // Esto lo formateamos antes de enviar
  type_id: string;
  id_number: number;
  address: string;
  phone: string;
  email?: string;
  number_licence: string;
  n_children: number;
  size_t_shift: string;
  name_t_shift: string;
  salary: number;
  photo?: string | null;
  status?: string;
  code?: string;
}
