const API_URL = 'https://dummyjson.com/todos';
const ADD_TODO_URL = 'https://dummyjson.com/todos/add';
const loading = document.getElementById('loading');
const errorBox = document.getElementById('error');
const todoList = document.getElementById('todoList');
const pagination = document.getElementById('pagination');
const addTodoForm = document.getElementById('addTodoForm');
const newTodoInput = document.getElementById('newTodo');
const searchInput = document.getElementById('search');
const fromDateInput = document.getElementById('fromDate');
const toDateInput = document.getElementById('toDate');
const addtask=document.getElementById('addtask');
const alltask=document.getElementById('alltask');
const searchtask=document.getElementById('searchtask');
const filter=document.getElementById('filter');
const totalDataFetch=100;

// ...............................create extra function area...............................................
const addToAll=(cls,...id) => {
    for(let i of id){
        i.classList.add(`${cls}`);
    }
}
const removeFromAll = (cls,...id) => {
    for(let i of id){
        i.classList.remove(`${cls}`);
    }
}
const showLoading = (state) => {
  loading.style.display = state ? 'block' : 'none';
};

const showError = (message) => {
  errorBox.textContent = message;
  errorBox.classList.remove('d-none');
  setTimeout(() => errorBox.classList.add('d-none'), 3000);
};

const randomDate = () => {
  const start = new Date(2024, 0, 1);
  const end = new Date();
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// ............................................empty todo list creation.......................................
let todos = [];

let currentPage = 1;
const itemsPerPage = 10;

const fetchTodos = async () => {
  try {
    showLoading(true);
    const res = await fetch(`${API_URL}?limit=${totalDataFetch}`);
    // console.log(res);
    const data = await res.json();
    // console.log(data.todos);
    todos = data.todos.map(todo => ({ ...todo, createdDate: randomDate() }));
    // console.log(todos);
    renderTodos();
  } catch (err) {
    showError('Failed to fetch todos.');
  } finally {
    showLoading(false);
  }
};

const renderTodos = () => {
  const filtered = filterTodos();
  const start = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(start, start + itemsPerPage);
  console.log(paginated);
  todoList.innerHTML = '';
  paginated.forEach(todo => {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.textContent = `${todo.todo} (Created: ${todo.createdDate.toISOString().split('T')[0]})`;
    todoList.appendChild(li);
  });
  renderPagination(filtered.length);
};

const renderPagination = (totalItems) => {
  const pageCount = Math.ceil(totalItems / itemsPerPage);
  pagination.innerHTML = '';
  for (let i = 1; i <= pageCount; i++) {
    const li = document.createElement('li');
    li.className = `page-item ${i === currentPage ? 'active' : ''}`;
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener('click', () => {
      currentPage = i;
      renderTodos();
    });
    pagination.appendChild(li);
  }
};

const filterTodos = () => {
  const searchTerm = searchInput.value.toLowerCase();
  const fromDate = fromDateInput.value ? new Date(fromDateInput.value) : null;
  const toDate = toDateInput.value ? new Date(toDateInput.value) : null;
  return todos.filter(todo => {
    const matchesSearch = todo.todo.toLowerCase().includes(searchTerm);
    const date = todo.createdDate;
    const afterFrom = fromDate ? date >= fromDate : true;
    const beforeTo = toDate ? date <= toDate : true;
    return matchesSearch && afterFrom && beforeTo;
  });
};

const addTodo = async (e) => {
  e.preventDefault();
  const newTodo = newTodoInput.value.trim();
  if (!newTodo) return;
  try {
    showLoading(true);
    const res = await fetch(ADD_TODO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ todo: newTodo, completed: false, userId: 1 })
    });
    const addedTodo = await res.json();
    addedTodo.createdDate = new Date();
    todos.unshift(addedTodo);
    newTodoInput.value = '';
    renderTodos();
  } catch (err) {
    showError('Failed to add todo.');
  } finally {
    showLoading(false);
  }
};

addTodoForm.addEventListener('submit', addTodo);
searchInput.addEventListener('input', () => { currentPage = 1; renderTodos(); });
fromDateInput.addEventListener('change', () => { currentPage = 1; renderTodos(); });
toDateInput.addEventListener('change', () => { currentPage = 1; renderTodos(); });

fetchTodos();