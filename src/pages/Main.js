import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { StyleSheet, View, Modal, ScrollView } from "react-native";
import {
  Text,
  Button,
  Card,
  Title,
  IconButton,
  TextInput,
  ActivityIndicator,
  MD2Colors,
} from "react-native-paper";
import uuid from "react-native-uuid";
import { generateClient } from "aws-amplify/api";
import config from "../amplifyconfiguration.json";
import { createTodo, deleteTodo } from "../graphql/mutations";
import { listTodos } from "../graphql/queries";
import { DrawerActions } from "@react-navigation/native";
import { withAuthenticator } from "@aws-amplify/ui-react-native";
import { Amplify } from "aws-amplify";
import amplifyconfig from "../amplifyconfiguration.json";
import { signOut } from "aws-amplify/auth";
import { useAuthenticator } from "@aws-amplify/ui-react-native";
Amplify.configure(amplifyconfig);

const client = generateClient({ authMode: "apiKey" });

const initialState = { description: "", name: "" };

function Main({ navigation }) {
  const [formState, setFormState] = useState(initialState);
  const [names, setNames] = useState("");
  const [descriptions, setDescriptions] = useState("");
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);

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

  async function fetchTodos() {
    setLoading(true);
    try {
      const todoData = await client.graphql({
        query: listTodos,
        authMode: "apiKey",
      });
      const todos = todoData.data.listTodos.items;
      setTodos(todos);
      setLoading(false);
    } catch (err) {
      console.log("error fetching todos");
      console.log(err);
    }
  }

  const loadLocalData = async () => {
    const tempLists = JSON.parse(await AsyncStorage.getItem("List"));
    if (tempLists === null || tempLists.length === 0) {
      console.log("Nothing to map");
    } else {
      setLists(tempLists);
      setEmpty(false);
    }
  };

  const deleteItem = async (id) => {
    setLoading(true);
    try {
      await client.graphql({
        query: deleteTodo,
        authMode: "apiKey",
        variables: {
          input: {
            id: id,
          },
        },
      });
      fetchTodos();
      setLoading(false);
    } catch (err) {
      console.log("error removing todo:", err);
    }
  };

  useEffect(() => {
    fetchTodos();
    loadLocalData();
  }, []);

  const AddATodo = async (message) => {
    let tempID = uuid.v4();
    let tempLists = lists;
    tempLists.push({ id: tempID, name: message });
    await AsyncStorage.setItem("List", JSON.stringify(tempLists));
  };

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      console.log("error signing out: ", error);
    }
  }

  async function addTodo() {
    try {
      if (names === "" || descriptions === "") return;
      const todo = { name: names, description: descriptions };
      setTodos([todo, ...todos]);
      setFormState(initialState);
      setDescriptions("");
      setNames("");
      await client.graphql({
        query: createTodo,
        authMode: "apiKey",
        variables: {
          input: todo,
        },
      });
    } catch (err) {
      console.log("error creating todo:", err);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView style={{ width: "100%" }}>
        <View style={styles.header}>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              marginTop: 20,
            }}
          >
            <IconButton
              icon="menu"
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            />
            <Text style={styles.heading}>Amplify Todos</Text>
          </View>
          <TextInput
            onChangeText={(text) => setNames(text)}
            style={styles.input}
            value={names}
            placeholder="Name"
          />
          <TextInput
            onChangeText={(text) => setDescriptions(text)}
            style={styles.input}
            value={descriptions}
            placeholder="Description"
          />
          <Button style={styles.button} onPress={addTodo} mode="contained">
            Create Todo
          </Button>
        </View>
        {loading ? (
          <ActivityIndicator
            size="large"
            animating={true}
            style={{ margin: 20 }}
          />
        ) : (
          <View>
            <View style={styles.cards}>
              {todos.map((todo, index) => (
                <Card key={todo.id ? todo.id : index} style={styles.innerCards}>
                  <Card.Content>
                    <Title>{todo.name}</Title>
                    <View style={styles.todo}>
                      <Text style={styles.todoDescription}>
                        {todo.description}
                      </Text>
                    </View>
                  </Card.Content>
                  <Card.Actions>
                    <IconButton
                      icon="delete"
                      onPress={() => {
                        deleteItem(todo.id);
                      }}
                    />
                  </Card.Actions>
                </Card>
              ))}
            </View>
          </View>
        )}
        <View style={{ marginBottom: 50, marginHorizontal: 20 }}>
          <Button mode="contained" onPress={() => handleSignOut()}>
            Sign Out
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

export default withAuthenticator(Main);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  todo: { marginBottom: 15 },
  input: {
    border: "none",
    backgroundColor: "#ddd",
    marginBottom: 10,
    padding: 8,
    fontSize: 18,
    minWidth: 200,
  },
  todoName: { fontSize: 20, fontWeight: "bold" },
  todoDescription: { marginBottom: 0 },
  heading: { fontSize: 30, margin: 20 },
  cards: { margin: 20 },
  innerCards: { margin: 10, minWidth: 300 },
  header: { marginHorizontal: 10 },
});
