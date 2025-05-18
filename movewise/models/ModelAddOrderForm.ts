export interface Person {
  first_name: string;
  last_name: string;
  address: string;
  email: string;
  phone:string;
}

export interface AddOrderForm {
  status: string;
  date: string;
  key_ref: string;
  state_usa: string;
  person: Person;
  weight: string;
  job: string;
  customer_factory?: number;
  dispatch_ticket?: string | null;
}