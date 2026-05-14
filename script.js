const STORAGE_KEYS = {
    tasks: "todo-app:tasks",
    theme: "todo-app:theme",
};

const FILTERS = {
    all: "all",
    pending: "pending",
    completed: "completed",
};

const elements = {
    form: document.querySelector("#taskForm"),
    input: document.querySelector("#taskInput"),
    list: document.querySelector("#taskList"),
    emptyState: document.querySelector("#emptyState"),
    filterButtons: document.querySelectorAll("[data-filter]"),
    themeToggle: document.querySelector("#themeToggle"),
    totalTasks: document.querySelector("#totalTasks"),
    completedTasks: document.querySelector("#completedTasks"),
};

let tasks = loadTasks();
let currentFilter = FILTERS.all;

function loadTasks() {
    const storedTasks = localStorage.getItem(STORAGE_KEYS.tasks);

    if (!storedTasks) {
        return [];
    }

    try {
        return JSON.parse(storedTasks);
    } catch {
        return [];
    }
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
}

function generateTaskId() {
    if (crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createTask(title) {
    return {
        id: generateTaskId(),
        title,
        completed: false,
        createdAt: new Date().toISOString(),
    };
}

function addTask(title) {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
        return;
    }

    tasks = [createTask(trimmedTitle), ...tasks];
    saveTasks();
    render();
}

function deleteTask(taskId) {
    tasks = tasks.filter((task) => task.id !== taskId);
    saveTasks();
    render();
}

function toggleTaskStatus(taskId) {
    tasks = tasks.map((task) => {
        if (task.id !== taskId) {
            return task;
        }

        return {
            ...task,
            completed: !task.completed,
        };
    });

    saveTasks();
    render();
}

function getFilteredTasks() {
    if (currentFilter === FILTERS.pending) {
        return tasks.filter((task) => !task.completed);
    }

    if (currentFilter === FILTERS.completed) {
        return tasks.filter((task) => task.completed);
    }

    return tasks;
}

function setFilter(filter) {
    currentFilter = filter;

    elements.filterButtons.forEach((button) => {
        const isActive = button.dataset.filter === filter;
        button.classList.toggle("active", isActive);
    });

    render();
}

function createTaskElement(task) {
    const item = document.createElement("li");
    item.className = "task-item";
    item.dataset.taskId = task.id;
    item.classList.toggle("completed", task.completed);

    const checkbox = document.createElement("input");
    checkbox.className = "task-check";
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Marcar ${task.title} como concluida`);

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.setAttribute("aria-label", `Excluir ${task.title}`);
    deleteButton.textContent = "×";

    item.append(checkbox, title, deleteButton);

    return item;
}

function renderTasks() {
    const filteredTasks = getFilteredTasks();
    const fragment = document.createDocumentFragment();

    filteredTasks.forEach((task) => {
        fragment.appendChild(createTaskElement(task));
    });

    elements.list.replaceChildren(fragment);
    elements.emptyState.classList.toggle("hidden", filteredTasks.length > 0);
}

function formatTaskCounter(amount) {
    return amount === 1 ? "1 tarefa" : `${amount} tarefas`;
}

function renderSummary() {
    const completedAmount = tasks.filter((task) => task.completed).length;

    elements.totalTasks.textContent = formatTaskCounter(tasks.length);
    elements.completedTasks.textContent =
        completedAmount === 1 ? "1 concluida" : `${completedAmount} concluidas`;
}

function render() {
    renderTasks();
    renderSummary();
}

function applyTheme(theme) {
    const isDark = theme === "dark";

    document.body.classList.toggle("dark", isDark);
    elements.themeToggle.setAttribute(
        "aria-label",
        isDark ? "Alternar para modo claro" : "Alternar para modo escuro"
    );
    localStorage.setItem(STORAGE_KEYS.theme, theme);
}

function toggleTheme() {
    const nextTheme = document.body.classList.contains("dark") ? "light" : "dark";
    applyTheme(nextTheme);
}

function loadTheme() {
    applyTheme("dark");
}


function handleFormSubmit(event) {
    event.preventDefault();
    addTask(elements.input.value);
    elements.input.value = "";
    elements.input.focus();
}

function handleListClick(event) {
    const taskItem = event.target.closest("[data-task-id]");

    if (!taskItem) {
        return;
    }

    const taskId = taskItem.dataset.taskId;

    if (event.target.matches(".delete-button")) {
        deleteTask(taskId);
        return;
    }

    if (event.target.matches(".task-check")) {
        toggleTaskStatus(taskId);
    }
}

function setupEventListeners() {
    elements.form.addEventListener("submit", handleFormSubmit);
    elements.list.addEventListener("click", handleListClick);
    elements.themeToggle.addEventListener("click", toggleTheme);

    elements.filterButtons.forEach((button) => {
        button.addEventListener("click", () => setFilter(button.dataset.filter));
    });
}

function init() {
    loadTheme();
    setupEventListeners();
    render();
}

init();
