import logo from './logo.svg';
import './App.css';
import React, {useState, useEffect, useMemo, useCallback, useContext, createContext} from 'react';
// import { GoogleLogin } from '@react-oauth/google';
import jwtDecode from "jwt-decode";
import { useParams } from 'react-router-dom';

function App() {
  // to do list
  const [todos, setTodos] = useState([]);
  const [inputs, setInput] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(false); // Loading state for API
  const [user, setUser] = useState({name: null});
  const [accessToken, setAccessToken] = useState(null);
  const [original, setOriginal] = useState([]);
  const [check, setCheck] = useState(false);
  const [inCheck, setInCheck] = useState(false);

  // handle input change
  const handleInputChange = (e) => {
    setInput(e.target.value);
  }

  // add to do
  const handleAddTodo = useCallback(() => {
    if (inputs) {
      console.log(inputs)
      setTodos([...todos, {text: inputs, isChecked: false}]);
      setInput("");
    }
  }, [inputs, todos]
);
  
  // handle edit input change
  const handleEditChange = (e) => {
    setEditValue(e.target.value);
  }

  // update to do
  // can directly and manually update the object text to a new editValue
  const handleEditTodo = (index) => {
    const updatedTodos = [...todos]
    console.log("sss",editValue);
    updatedTodos[index].text = editValue
    setTodos(updatedTodos)
    setEditIndex(null); // or setEditIndex(-1);
  }

  const handleEditInput = (index) => {
    const updatedTodos = [...todos]
    setEditIndex(index)
    setEditValue(updatedTodos[index].text)
  }

  // event.key
  const handleClickEvent = (event) => (index) => {
    if (event.key === "Enter") {
      handleEditTodo(index)
    }
  }

  // mark as done
  const handleCheckboxChange = (index) => {
    const isComplete = [...todos]
    isComplete[index].isChecked = !isComplete[index].isChecked
    setTodos(isComplete)
  }

  // count completed tasks
  const completed = useMemo(() => {
    return todos.filter((todo) => todo.isChecked).length;
  }, [todos]
);

  // clear all to do
  const handleClear = () => {
    setTodos([])
  }

  const handleFilterCompleted = () => {
    console.log("call1")
    setCheck(!check)
    console.log("test", check)
    setInCheck(false)
    handleFilter(!check, false)
}

const handleFilterIncompleted = () => {
    console.log("call99")
    setInCheck(!inCheck)
    console.log(inCheck)
    setCheck(false)
    handleFilter(false, !inCheck)
}

  return (
    <div className="App">
      <header className="App-header">
        <h1>Lik Ming's To Do List</h1>

      <ul>
        <div>
          <input 
            type="text"
            value={inputs}
            placeholder={'Add a new task'}
            onChange={(event) => handleInputChange(event)}
            />
          <button onClick={() => handleAddTodo()}>Add Task</button>
          <button onClick={() => handleClear()}>Reset</button>


        {todos.map((todo, index) => (
          <li key={index}>
            <input
              type="checkbox"
              onChange={() => handleCheckboxChange(index)}
              checked={todo.isChecked}
            />

          {editIndex === index ? (
          <input 
            type= "text"
            value={editValue}
            onChange={(e) => handleEditChange(e)}
            onBlur={() => handleEditTodo(index)}
            onKeyDown={(e) => handleClickEvent(e)(index)}
          />
           ) : (
            <span onClick={() => handleEditInput(index)}>{todo.text}</span>
           )}

          <button onClick={() => setTodos(todos.filter((_, i) => i !== index)
        )}>Delete</button>
          </li>
        ))
      }
      <div>Completed tasks: {completed}</div>

      <input 
        type ="checkbox"
        onChange={() => handleFilterCompleted()}
        checked={check}
        />Filter Completed

      <input 
      type = "checkbox"
      onChange= {() => handleFilterIncompleted()}
      checked={inCheck}
      />Filter InCompleted

      </div>
        <div>
        <img src={logo} className="App-logo" alt="logo" />
        </div>
      </ul>
      </header>
    </div>
  );
}

export default App;
