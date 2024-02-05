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
import { generateClient } from "aws-amplify/api";

import { createTodo } from "./src/graphql/mutations";
import { listTodos } from "./src/graphql/queries";

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
    <div style={styles.container}>
      <h2>Amplify Todos</h2>
      <input
        onChange={(event) =>
          setFormState({ ...formState, name: event.target.value })
        }
        style={styles.input}
        value={formState.name}
        placeholder="Name"
      />
      <input
        onChange={(event) =>
          setFormState({ ...formState, description: event.target.value })
        }
        style={styles.input}
        value={formState.description}
        placeholder="Description"
      />
      <button style={styles.button} onClick={addTodo}>
        Create Todo
      </button>
      {todos.map((todo, index) => (
        <div key={todo.id ? todo.id : index} style={styles.todo}>
          <p style={styles.todoName}>{todo.name}</p>
          <p style={styles.todoDescription}>{todo.description}</p>
        </div>
      ))}
    </div>
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
  },
  todoName: { fontSize: 20, fontWeight: "bold" },
  todoDescription: { marginBottom: 0 },
});
