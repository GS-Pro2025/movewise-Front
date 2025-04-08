export interface Person {
  first_name: string;
  last_name: string;
  address: string;
  email: string;
}

export interface AddOrderForm {
  status: string;
  date: string;
  key_ref: string;
  address: string;
  state_usa: string;
  phone: string;
  person: Person;
  weight: string;
  job: string;
  company?: string;
}