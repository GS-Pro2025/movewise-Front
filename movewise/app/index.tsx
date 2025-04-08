import { Redirect } from "expo-router";
//Home solo
export default function Index() {
  return <Redirect href="/Login"/>;
  //return <Redirect href="/Home" />;
}

