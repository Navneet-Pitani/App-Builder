(function () {
  // ---------- Utility ----------
  const STORAGE_KEY = 'colorfulTodo';
  const THEME_KEY = 'colorfulTodoTheme';

  // Simple UUID generator fallback for older browsers
  function generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    // fallback: random string
    return 'todo-' + Date.now() + '-' + Math.random().toString(16).slice(2);
  }

  // ---------- Todo Model ----------
  class Todo {
    constructor({ id, title, description = '', completed = false, order = 0 }) {
      this.id = id || generateId();
      this.title = title;
      this.description = description;
      this.completed = completed;
      this.order = order;
    }
  }

  // ---------- Store ----------
  const TodoStore = {
    todos: [],

    load() {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const arr = JSON.parse(raw);
          this.todos = arr.map((obj) => new Todo(obj));
        } catch (e) {
          console.error('Failed to parse stored todos', e);
          this.todos = [];
        }
      } else {
        this.todos = [];
      }
      // Ensure order consistency and sort
      this.todos.sort((a, b) => a.order - b.order);
    },

    save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.todos));
    },

    add(todo) {
      // assign order as the next integer
      const maxOrder = this.todos.length ? Math.max(...this.todos.map((t) => t.order)) : -1;
      todo.order = maxOrder + 1;
      this.todos.push(todo);
      this.save();
    },

    update(id, updates) {
      const idx = this.todos.findIndex((t) => t.id === id);
      if (idx === -1) return;
      Object.assign(this.todos[idx], updates);
      this.save();
    },

    remove(id) {
      this.todos = this.todos.filter((t) => t.id !== id);
      // Re‑order remaining items
      this.todos.forEach((t, i) => (t.order = i));
      this.save();
    },

    /**
     * Reorder a todo to a new index (0‑based) within the ordered list.
     * After moving, orders are re‑assigned sequentially.
     */
    reorder(id, newIndex) {
      const currentIdx = this.todos.findIndex((t) => t.id === id);
      if (currentIdx === -1) return;
      const [item] = this.todos.splice(currentIdx, 1);
      // Adjust newIndex if the removal happened before it
      if (currentIdx < newIndex) newIndex--;
      this.todos.splice(newIndex, 0, item);
      // Re‑assign order values
      this.todos.forEach((t, i) => (t.order = i));
      this.save();
    },
  };

  // ---------- Rendering ----------
  let currentFilter = 'all';

  function renderTodoList(filter = currentFilter) {
    const listEl = document.getElementById('todoList');
    if (!listEl) return;
    listEl.innerHTML = '';
    const template = document.getElementById('todoItemTemplate');
    if (!template) return;

    const filtered = TodoStore.todos.filter((todo) => {
      if (filter === 'active') return !todo.completed;
      if (filter === 'completed') return todo.completed;
      return true; // all
    });

    filtered.forEach((todo) => {
      const clone = document.importNode(template.content, true);
      const li = clone.querySelector('li');
      if (!li) return;
      li.dataset.id = todo.id;
      // make the whole item draggable but we only start drag from handle
      li.setAttribute('draggable', 'true');

      // Populate fields
      const checkbox = li.querySelector('.toggle-complete');
      if (checkbox) checkbox.checked = todo.completed;

      const titleEl = li.querySelector('.title');
      if (titleEl) titleEl.textContent = todo.title;

      const descEl = li.querySelector('.description');
      if (descEl) descEl.textContent = todo.description;

      if (todo.completed) li.classList.add('completed'); else li.classList.remove('completed');

      // Ensure drag handle is draggable
      const dragHandle = li.querySelector('.drag-handle');
      if (dragHandle) dragHandle.setAttribute('draggable', 'true');

      listEl.appendChild(clone);
    });

    applyEventListeners();
  }

  // ---------- Event Handlers ----------
  function handleAddTodo() {
    const titleInput = document.getElementById('newTodoTitle');
    const descInput = document.getElementById('newTodoDesc');
    const title = titleInput ? titleInput.value.trim() : '';
    const description = descInput ? descInput.value.trim() : '';
    if (!title) return; // ignore empty titles
    const todo = new Todo({ title, description, completed: false });
    TodoStore.add(todo);
    if (titleInput) titleInput.value = '';
    if (descInput) descInput.value = '';
    renderTodoList();
  }

  function handleToggleComplete(e) {
    const li = e.target.closest('li');
    if (!li) return;
    const id = li.dataset.id;
    const todo = TodoStore.todos.find((t) => t.id === id);
    if (!todo) return;
    TodoStore.update(id, { completed: !todo.completed });
    renderTodoList();
  }

  function handleDeleteTodo(e) {
    const li = e.target.closest('li');
    if (!li) return;
    const id = li.dataset.id;
    TodoStore.remove(id);
    renderTodoList();
  }

  function handleEditTodo(e) {
    const li = e.target.closest('li');
    if (!li) return;
    const id = li.dataset.id;
    const todo = TodoStore.todos.find((t) => t.id === id);
    if (!todo) return;

    // Replace title and description with inputs
    const titleSpan = li.querySelector('.title');
    const descP = li.querySelector('.description');
    if (!titleSpan || !descP) return;

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.className = 'edit-title-input';
    titleInput.value = todo.title;

    const descTextarea = document.createElement('textarea');
    descTextarea.className = 'edit-desc-textarea';
    descTextarea.value = todo.description;

    titleSpan.replaceWith(titleInput);
    descP.replaceWith(descTextarea);

    titleInput.focus();

    function saveEdit() {
      const newTitle = titleInput.value.trim();
      const newDesc = descTextarea.value.trim();
      if (newTitle) {
        TodoStore.update(id, { title: newTitle, description: newDesc });
      }
      renderTodoList();
    }

    titleInput.addEventListener('blur', saveEdit);
    descTextarea.addEventListener('blur', saveEdit);
    titleInput.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        titleInput.blur();
      }
    });
  }

  function handleFilterClick(e) {
    const filter = e.target.dataset.filter;
    if (!filter) return;
    currentFilter = filter;
    // Update active class on buttons
    const buttons = document.querySelectorAll('#filters button');
    buttons.forEach((btn) => {
      if (btn.dataset.filter === filter) btn.classList.add('active');
      else btn.classList.remove('active');
    });
    renderTodoList();
  }

  function handleDarkModeToggle() {
    const root = document.documentElement;
    const current = root.dataset.theme === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem(THEME_KEY, next);
  }

  // ---------- Drag & Drop ----------
  function handleDragStart(e) {
    const li = e.target.closest('li');
    if (!li) return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', li.dataset.id);
    li.classList.add('dragging');
  }

  function handleDragOver(e) {
    e.preventDefault(); // allow drop
    const li = e.target.closest('li');
    if (!li || li.classList.contains('dragging')) return;
    li.classList.add('drag-over');
  }

  function handleDragLeave(e) {
    const li = e.target.closest('li');
    if (li) li.classList.remove('drag-over');
  }

  function handleDrop(e) {
    e.preventDefault();
    const targetLi = e.target.closest('li');
    if (!targetLi) return;
    targetLi.classList.remove('drag-over');
    const draggedId = e.dataTransfer.getData('text/plain');
    const targetId = targetLi.dataset.id;
    if (!draggedId || !targetId || draggedId === targetId) return;
    const targetIdx = TodoStore.todos.findIndex((t) => t.id === targetId);
    // Insert before the target element
    TodoStore.reorder(draggedId, targetIdx);
    renderTodoList();
  }

  function handleDragEnd(e) {
    const li = e.target.closest('li');
    if (li) li.classList.remove('dragging');
    document.querySelectorAll('.drag-over').forEach((el) => el.classList.remove('drag-over'));
  }

  // ---------- Event Wiring ----------
  function applyEventListeners() {
    const listEl = document.getElementById('todoList');
    if (!listEl) return;

    // Replace with clone to clear previous listeners (simple approach)
    const freshList = listEl.cloneNode(true);
    listEl.parentNode.replaceChild(freshList, listEl);

    freshList.addEventListener('change', (e) => {
      if (e.target.matches('.toggle-complete')) handleToggleComplete(e);
    });

    freshList.addEventListener('click', (e) => {
      if (e.target.matches('.edit-btn')) handleEditTodo(e);
      else if (e.target.matches('.delete-btn')) handleDeleteTodo(e);
    });

    // Drag & Drop listeners (start from handle)
    freshList.addEventListener('dragstart', (e) => {
      if (e.target.matches('.drag-handle') || e.target.closest('.drag-handle')) handleDragStart(e);
    });
    freshList.addEventListener('dragover', handleDragOver);
    freshList.addEventListener('dragleave', handleDragLeave);
    freshList.addEventListener('drop', handleDrop);
    freshList.addEventListener('dragend', handleDragEnd);
  }

  // ---------- Initialization ----------
  document.addEventListener('DOMContentLoaded', () => {
    TodoStore.load();

    const savedTheme = localStorage.getItem(THEME_KEY);
    document.documentElement.dataset.theme = savedTheme || 'light';

    renderTodoList();

    const addBtn = document.getElementById('addTodoBtn');
    if (addBtn) addBtn.addEventListener('click', handleAddTodo);

    const titleInput = document.getElementById('newTodoTitle');
    if (titleInput) {
      titleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAddTodo();
        }
      });
    }

    const filterNav = document.getElementById('filters');
    if (filterNav) filterNav.addEventListener('click', handleFilterClick);

    const darkToggle = document.getElementById('darkModeToggle');
    if (darkToggle) darkToggle.addEventListener('click', handleDarkModeToggle);
  });

  // Expose public API under global namespace
  window.TodoApp = {
    Todo,
    TodoStore,
    renderTodoList,
    addTodo: (todo) => TodoStore.add(todo),
    updateTodo: (id, updates) => TodoStore.update(id, updates),
    removeTodo: (id) => TodoStore.remove(id),
    reorderTodo: (id, newIdx) => TodoStore.reorder(id, newIdx),
  };
})();
