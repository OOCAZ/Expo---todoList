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
} from "react-native-paper";
import uuid from "react-native-uuid";
import { generateClient } from "aws-amplify/api";
import config from "./src/amplifyconfiguration.json";
import { Amplify } from "aws-amplify";
import { createTodo, deleteTodo } from "./src/graphql/mutations";
import { listTodos } from "./src/graphql/queries";

Amplify.configure(config);
const initialState = { name: "", description: "" };
const client = generateClient();

export default function App() {
  const [formState, setFormState] = useState(initialState);
  const [todos, setTodos] = useState([]);

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
    try {
      const todoData = await client.graphql({
        query: listTodos,
      });
      const todos = todoData.data.listTodos.items;
      setTodos(todos);
    } catch (err) {
      console.log("error fetching todos");
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
    try {
      await client.graphql({
        query: deleteTodo,
        variables: {
          input: {
            id: id,
          },
        },
      });
      fetchTodos();
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

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return;
      const todo = { ...formState };
      setTodos([...todos, todo]);
      setFormState(initialState);
      await client.graphql({
        query: createTodo,
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
          <Text style={styles.heading}>Amplify Todos</Text>
          <TextInput
            onChange={(event) =>
              setFormState({ ...formState, name: event.target.value })
            }
            style={styles.input}
            value={formState.name}
            placeholder="Name place"
          />
          <TextInput
            onChange={(event) =>
              setFormState({ ...formState, description: event.target.value })
            }
            style={styles.input}
            value={formState.description}
            placeholder="Description"
          />
          <Button style={styles.button} onPress={addTodo} mode="contained">
            Create Todo
          </Button>
        </View>
        <View style={styles.cards}>
          {todos.map((todo, index) => (
            <Card key={todo.id ? todo.id : index} style={styles.innerCards}>
              <Card.Content>
                <Title>{todo.name}</Title>
                <View style={styles.todo}>
                  <Text style={styles.todoDescription}>{todo.description}</Text>
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
      </ScrollView>
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
