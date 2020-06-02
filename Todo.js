import React, { useEffect, useState, useRef } from 'react'
import {
  View, Text, StyleSheet, TextInput, Button
} from 'react-native'

import { API, graphqlOperation, DataStore, Predicates, Auth } from 'aws-amplify'
// import { createTodo } from './src/graphql/mutations'
// import { listTodos } from './src/graphql/queries'
import { onCreateTodo } from './src/graphql/subscriptions'
import { Todo as TodoModel } from './src/models/index'
import { PgpKey } from './src/shared/security/PgpKey';

const initialState = { name: '', description: '' }

const Todo = () => {
  const [formState, setFormState] = useState(initialState)
  const [todos, setTodos] = useState([])
  const [user, setUser] = useState([])
  const latestUpdateTodos = useRef(null);

  useEffect(() => {
    fetchTodos(),
      reloadTodo(),
      getCurrentUserDetails()
  }, [])

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value })
  }

  function updateTodos(todo) {
    setTodos([...todos, todo])
  }
  latestUpdateTodos.current = updateTodos;

  async function getCurrentUserDetails() {
    const user = await Auth.currentUserInfo();
    setUser(user);
    console.log(user.attributes.phone_number)
    PgpKey.generate(user.attributes.phone_number, (key) => console.log(key));
  }

  async function fetchTodos() {
    try {
      // const todoData = await API.graphql(graphqlOperation(listTodos))
      // const todos = todoData.data.listTodos.items
      const todos = await DataStore.query(TodoModel, Predicates.ALL);
      console.log(todos, DataStore);
      setTodos(todos);
    } catch (err) { console.log(err, 'error fetching todos') }
  }

  function reloadTodo() {
    /*
    const subscription = API.graphql(
      graphqlOperation(onCreateTodo)
    ).subscribe({
      next: (event) => {
        if (event) {
          latestUpdateTodos.current(event);
        }
      }
    });
    */
    const subscription = DataStore.observe(TodoModel).subscribe(event => {
      if (event.opType === "INSERT") {
        latestUpdateTodos.current(event.element);
      }
    });
  }

  async function addTodo() {
    console.log(user);
    try {
      const todo = { ...formState }
      setFormState(initialState)
      // await API.graphql(graphqlOperation(createTodo, { input: todo }))
      await DataStore.save(new TodoModel(todo));
    } catch (err) {
      console.log('error creating todo:', err)
    }
  }

  
  return (
    <View style={styles.container}>
      <TextInput
        onChangeText={val => setInput('name', val)}
        style={styles.input}
        value={formState.name}
        placeholder="Name"
      />
      <TextInput
        onChangeText={val => setInput('description', val)}
        style={styles.input}
        value={formState.description}
        placeholder="Description"
      />
      <Button title="Create Todo" onPress={addTodo} />
      {
        todos.map((todo, index) => (
          <View key={todo.id ? todo.id : index} style={styles.todo}>
            <Text style={styles.todoName}>{todo.name}</Text>
            <Text> - {todo.description}</Text>
          </View>
        ))
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  todo: { marginBottom: 15 },
  input: { height: 50, backgroundColor: '#ddd', marginBottom: 10, padding: 8 },
  todoName: { fontSize: 18, fontWeight: '900' }
})

export default Todo