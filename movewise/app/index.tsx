import { Redirect } from "expo-router";
// App.tsx (o donde montes tu router)
import 'formdata-polyfill/esm.min.js';

//Home solo
export default function Index() {
  return <Redirect href="/Login"/>;
  //return <Redirect href="/Home" />;
}

