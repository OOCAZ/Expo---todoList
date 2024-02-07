import { NavigationContainer } from "@react-navigation/native";
import "react-native-gesture-handler";

import Main from "./src/pages/Main";
import { createDrawerNavigator } from "@react-navigation/drawer";

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
