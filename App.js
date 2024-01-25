import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { StyleSheet, View, Modal } from "react-native";
import {
  Text,
  Button,
  Card,
  Title,
  IconButton,
  TextInput,
} from "react-native-paper";
import uuid from "react-native-uuid";

export default function App() {
  const [lists, setLists] = useState([]);
  const [areAdding, setAreAdding] = useState(false);
  const [addInput, setAddInput] = useState("");
  const [empty, setEmpty] = useState(true);
  const [toggle, setToggle] = useState(false);

  const loadAWSData = async () => {
    await axios
      .get("url_here")
      .then(setLists(response.data))
      .catch((e) => {
        console.log("There was an error: " + e);
      });
  };

  const loadLocalData = async () => {
    const tempLists = JSON.parse(await AsyncStorage.getItem("List"));
    if (tempLists === null || tempLists.length === 0) {
      console.log("Nothing to map");
    } else {
      setLists(tempLists);
      setEmpty(false);
    }
  };

  const deleteItem = async (element) => {
    let tempLists = lists;
    tempLists.pop([element]);
    setLists(tempLists);
    if (tempLists.length === 0) {
      setEmpty(true);
    }
    await AsyncStorage.setItem("List", JSON.stringify(tempLists));
  };

  useEffect(() => {
    loadLocalData();
  }, []);

  const AddATodo = async (message) => {
    let tempID = uuid.v4();
    let tempLists = lists;
    tempLists.push({ id: tempID, name: message });
    await AsyncStorage.setItem("List", JSON.stringify(tempLists));
  };

  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        onPress={() => {
          setAreAdding(true);
        }}
      >
        Add a List Item
      </Button>
      {empty ? (
        <Text>Please Add an Entry</Text>
      ) : (
        lists.map((element) => {
          return (
            <Card key={element.id}>
              <Card.Content>
                <Title>{element.name}</Title>
              </Card.Content>
              <Card.Actions>
                <IconButton
                  icon="delete"
                  onPress={() => {
                    deleteItem(element);
                    loadLocalData();
                    setToggle(!toggle);
                  }}
                />
              </Card.Actions>
            </Card>
          );
        })
      )}
      <Button
        mode="contained"
        onPress={async () => {
          console.log(JSON.parse(await AsyncStorage.getItem("List")));
        }}
      >
        Log Lists Value
      </Button>
      <Button
        mode="contained"
        onPress={async () => {
          await AsyncStorage.removeItem("List");
          loadLocalData();
          setToggle(!toggle);
        }}
      >
        Clear Lists Value
      </Button>
      <StatusBar style="auto" />
      <Modal visible={areAdding}>
        <View>
          <TextInput
            value={addInput}
            onChangeText={(element) => {
              setAddInput(element);
            }}
          />
          <Button
            mode="contained"
            onPress={() => {
              AddATodo(addInput);
              setAddInput("");
              loadLocalData();
              setAreAdding(false);
            }}
          >
            Add Entry
          </Button>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
