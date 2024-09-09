import logo from './logo.svg';
import './App.css';
import React, {useState, useEffect, useMemo, useCallback, } from 'react';
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

    /*
    * Create form to request access token from Google's OAuth 2.0 server.
    */
    const oauthSignIn = () => {
      localStorage.clear();
      // create random state value and store in local storage
      var state = generateCryptoRandomState();
      localStorage.setItem('state', state);

      // Google's OAuth 2.0 endpoint for requesting an access token
      var oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

      // Create <form> element to submit parameters to OAuth 2.0 endpoint.
      var form = document.createElement('form');
      form.setAttribute('method', 'GET'); // Send as a GET request.
      form.setAttribute('action', oauth2Endpoint);

      // Parameters to pass to OAuth 2.0 endpoint.
      var params = {'client_id': '455750732220-2rln3dlt3445mo36q6kcvdhe4l659csg.apps.googleusercontent.com',
                    'redirect_uri': 'http://localhost:3000',
                    'response_type': 'token',
                    'scope': 'https://www.googleapis.com/auth/drive.metadata.readonly',
                    'include_granted_scopes': 'true',
                    'state': state};
      // Add form parameters as hidden input values.
      for (var p in params) {
        var input = document.createElement('input');
        input.setAttribute('type', 'hidden');
        input.setAttribute('name', p);
        input.setAttribute('value', params[p]);
        form.appendChild(input);
      }

      // Add form to page and submit it to open the OAuth 2.0 endpoint.
      document.body.appendChild(form);
      form.submit();
      
    }
    // Function to generate a random state value
    function generateCryptoRandomState() {
      const randomValues = new Uint32Array(2);
      window.crypto.getRandomValues(randomValues);
  
      // Encode as UTF-8
      const utf8Encoder = new TextEncoder();
      const utf8Array = utf8Encoder.encode(
        String.fromCharCode.apply(null, randomValues)
      );
  
      // Base64 encode the UTF-8 data
      return btoa(String.fromCharCode.apply(null, utf8Array))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }
  
  // If there's an access token, try an API request.
  // Otherwise, start OAuth 2.0 flow.
  function trySampleRequest() {
    const SCOPE = 'https://www.googleapis.com/auth/drive.metadata.readonly';
    var params = JSON.parse(localStorage.getItem('oauth2-test-params'));
    console.log("params", params)
    if (params && params['access_token']) {
      var current_scope_granted = false;
      if (params.hasOwnProperty('scope')) {
        var scopes = params['scope'].split(' ');
        for (var s = 0; s < scopes.length; s++) {
          if (SCOPE == scopes[s]) {
            current_scope_granted = true;
          }
        }
      }

      if (!current_scope_granted) {
        oauthSignIn(); // This function is defined elsewhere in this document.
      } else {
        // Since you already have access, you can proceed with the API request.
        var xhr = new XMLHttpRequest();
        xhr.open('GET',
          'https://www.googleapis.com/drive/v3/about?fields=user&' +
          'access_token=' + params['access_token']);
        xhr.onreadystatechange = function (e) {
          if (xhr.readyState === 4 && xhr.status === 200) {
            console.log(xhr.response);
          } else if (xhr.readyState === 4 && xhr.status === 401) {
            // Token invalid, so prompt for user permission.
            oauthSignIn();
          }
        };
        xhr.send(null);
      }
    } else {
      oauthSignIn();
      console.log("start")
    }
  }

    
  useEffect(() => {
      // Parse URL fragment to get access token

      var fragmentString = window.location.hash.substring(1);
      var params = {};
      var regex = /([^&=]+)=([^&]*)/g, m;
      while (m = regex.exec(fragmentString)) {
        params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
      }
      if (Object.keys(params).length > 0 && params['state']) {
        if (params['state'] == localStorage.getItem('state')) {
          localStorage.setItem('oauth2-test-params', JSON.stringify(params) );
    
          trySampleRequest();
        } else {
          console.log("param state:", params['state'], "getItem state:", localStorage.getItem('state'))
          console.log('State mismatch. Possible CSRF attack');
        }
      }
    
    }, []);

  const handleCredentialResponse = async (response) => {
      const userObject = response.credential
      console.log("Encoded JWT ID token: ", response.credential);    
      // Here, send the token to your backend or use it to fetch Google Task data

      // Load the GAPI client for tasks API after successful login
      await loadClient();
  }

  const loadClient = async () => {
    try {
      await loadGapiScript(); // Function to load GAPI script dynamically
      console.log("aaa", loadGapiScript())
      window.gapi.client.setApiKey("AIzaSyDPgYPQZaoGbyQIS1iNxi-9jWjch84lkc0");
      await window.gapi.client.load("https://content.googleapis.com/discovery/v1/apis/tasks/v1/rest");
      console.log("GAPI client loaded for API");
      fetchTasks(); // Fetch tasks
    } catch (error) {
      console.error("Error loading GAPI client:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await window.gapi.client.tasks.tasks.list({
        tasklist: "@default",
      });
      console.log("12345", response)
      setTodos(response.result.items || []);
      setLoading(true);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  // Ensure the window object has loaded GIS before calling it
  function loadGapiScript() {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = "https://apis.google.com/js/api.js";
      // script.onload = oauthSignIn(); // After script is loaded, initialize Google Login
      document.body.appendChild(script);
    });
  }

  //   loadGapiScript();
  // }, []); // Empty array ensures this runs only onc

  const searchParams = new URLSearchParams(document.location.search)
  console.log(searchParams.get('access_token'))


  // useEffect(() => {
  //   const fetchData = async () => {
  //   try {
  //     const response = await fetch('https://www.googleapis.com/tasks/v1/lists//tasks');
  //     const data = await response.json();
  //     setTodos(data.items || []); // Default to an empty array if data.items is undefined
  //     } catch (error) {
  //       console.log('Error fetching todos: ', error);
  //       setTodos([]); // In case of error, set an empty array to prevent errors
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, []);

  // handle input change
  const handleInputChange = (e) => {
    setInput(e.target.value);
  }

  const addTaskToGoogle = async (taskText) => {
    try {
      const response = await window.gapi.client.tasks.tasks.insert({
        tasklist: "@default",
        resource: {
          title: taskText,
        },
      });
      console.log("Task added to Google Tasks:", response);
    } catch (error) {
      console.error("Error adding task to Google Tasks:", error);
    }
  };

  // add to do
  const handleAddTodo = useCallback(() => {
    if (inputs) {
      console.log(inputs)
      setTodos([...todos, {text: inputs, isChecked: false}]);
      setInput("");
      addTaskToGoogle(inputs);
    }
  }, [inputs, todos]
);
  
  // handle edit input change
  const handleEditChange = (e) => {
    setEditValue(e.target.value);
  }

  const updateGoogleTask = async (taskId, newTaskText) => {
    try {
      const response = await window.gapi.client.tasks.tasks.update({
        tasklist: "@default",
        task: taskId, // The task ID to update
        resource: {
          title: newTaskText,
        },
      });
      console.log("Task updated in Google Tasks:", response);
    } catch (error) {
      console.error("Error updating Google Task:", error);
    }
  };

  // update to do
  // can directly and manually update the object text to a new editValue
  const handleEditTodo = (index) => {
    const updatedTodos = [...todos]
    console.log("sss",editValue);
    updatedTodos[index].text = editValue
    setTodos(updatedTodos)
    setEditIndex(null); // or setEditIndex(-1);
    const taskId = todos[index].id;
    updateGoogleTask(taskId, editValue);
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

  // clear done to do

  // clear not done to do

  // clear all to do



  return (
    <div className="App">
      <header className="App-header">
        <h1>Lik Ming's To Do List</h1>
        <a>
          <button onClick={() => trySampleRequest()}>sign in</button>
        </a>
        {loading ? <p>Loading tasks...</p> : (
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
      </div>
        <div>
        <img src={logo} className="App-logo" alt="logo" />
        </div>
      </ul>
        )}
      </header>
    </div>
  );
}

export default App;
