import { NavigationContainer } from "@react-navigation/native";
import "react-native-gesture-handler";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Main from "./src/pages/Main";
import Home from "./src/pages/Home";

const Drawer = createDrawerNavigator();

function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator>
        <Drawer.Screen
          name="Main"
          component={Main}
          options={{ headerShown: false }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

export default App;
