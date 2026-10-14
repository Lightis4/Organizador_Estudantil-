
document.addEventListener("DOMContentLoaded", () => {
    const STORAGE_KEY = "studyflow_tasks_v1";

    const taskModalElement = document.getElementById("taskModal");
    const taskModal = new bootstrap.Modal(taskModalElement);
    const toastElement = document.getElementById("appToast");
    const appToast = new bootstrap.Toast(toastElement, {
        delay: 2800
    });

    const taskForm = document.getElementById("taskForm");
    const taskList = document.getElementById("taskList");
    const allTaskList = document.getElementById("allTaskList");
    const emptyState = document.getElementById("emptyState");
    const allEmptyState = document.getElementById("allEmptyState");
    const formError = document.getElementById("formError");

    const taskTitle = document.getElementById("taskTitle");
    const taskSubject = document.getElementById("taskSubject");
    const taskDate = document.getElementById("taskDate");
    const taskPriority = document.getElementById("taskPriority");
    const taskNotes = document.getElementById("taskNotes");
    const taskId = document.getElementById("taskId");

    const timerDisplay = document.getElementById("timerDisplay");
    const timerLabel = document.getElementById("timerLabel");
    const timerCircle = document.getElementById("timerCircle");
    const startTimerButton = document.getElementById("startTimer");

    let tasks = loadTasks();
    let currentFilter = "todas";
    let currentView = "inicio";
    let timerInterval = null;
    let selectedMinutes = 25;
    let remainingSeconds = selectedMinutes * 60;
    let timerRunning = false;
    let timerEndTime = null;

    const today = getLocalDateString();

    taskDate.min = today;

    const formattedToday = new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(new Date());

    document.getElementById("todayLabel").textContent =
        formattedToday.charAt(0).toUpperCase() + formattedToday.slice(1);

    function getLocalDateString() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function loadTasks() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (!saved) {
                return [];
            }

            const parsed = JSON.parse(saved);

            if (!Array.isArray(parsed)) {
                return [];
            }

            return parsed.filter(task =>
                task &&
                typeof task.id === "string" &&
                typeof task.title === "string" &&
                typeof task.subject === "string" &&
                typeof task.date === "string" &&
                ["baixa", "media", "alta"].includes(task.priority) &&
                typeof task.completed === "boolean"
            );
        } catch (error) {
            return [];
        }
    }

    function saveTasks() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
            return true;
        } catch (error) {
            showToast("Não foi possível salvar os dados neste navegador.");
            return false;
        }
    }

    function showToast(message) {
        document.getElementById("toastMessage").textContent = message;
        appToast.show();
    }

    function formatDate(dateString) {
        const parts = dateString.split("-");

        if (parts.length !== 3) {
            return dateString;
        }

        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    function getDateStatus(dateString, completed) {
        if (completed) {
            return "Concluída";
        }

        if (dateString < today) {
            return "Atrasada";
        }

        if (dateString === today) {
            return "Hoje";
        }

        return formatDate(dateString);
    }

    function createElement(tag, className, text) {
        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        if (text !== undefined) {
            element.textContent = text;
        }

        return element;
    }

    function createTaskElement(task) {
        const item = createElement(
            "article",
            `task-item${task.completed ? " completed" : ""}`
        );

        const checkbox = createElement("input", "task-check");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute(
            "aria-label",
            `Marcar ${task.title} como ${task.completed ? "pendente" : "concluída"}`
        );

        checkbox.addEventListener("change", () => {
            toggleTask(task.id);
        });

        const info = createElement("div", "task-info");

        const title = createElement("h3", "task-title", task.title);
        const subject = createElement("span", "task-subject", task.subject);

        info.append(title, subject);

        if (task.notes) {
            const notes = createElement(
                "span",
                "task-subject",
                `Observação: ${task.notes}`
            );
            info.append(notes);
        }

        const meta = createElement("div", "task-meta");

        const dateLabel = createElement(
            "span",
            "task-date",
            `◷ ${getDateStatus(task.date, task.completed)}`
        );

        const priorityNames = {
            alta: "Alta prioridade",
            media: "Média prioridade",
            baixa: "Baixa prioridade"
        };

        const priority = createElement(
            "span",
            `priority-badge priority-${task.priority}`,
            priorityNames[task.priority]
        );

        meta.append(dateLabel, priority);
        info.append(meta);

        const actions = createElement("div", "task-actions");

        const editButton = createElement("button", "task-action", "✎");
        editButton.type = "button";
        editButton.setAttribute("aria-label", `Editar ${task.title}`);
        editButton.title = "Editar tarefa";

        editButton.addEventListener("click", () => {
            openEditModal(task.id);
        });

        const deleteButton = createElement(
            "button",
            "task-action delete",
            "×"
        );

        deleteButton.type = "button";
        deleteButton.setAttribute("aria-label", `Excluir ${task.title}`);
        deleteButton.title = "Excluir tarefa";

        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });

        actions.append(editButton, deleteButton);
        item.append(checkbox, info, actions);

        return item;
    }

    function getFilteredTasks() {
        const sorted = [...tasks].sort((a, b) => {
            if (a.completed !== b.completed) {
                return Number(a.completed) - Number(b.completed);
            }

            if (a.date !== b.date) {
                return a.date.localeCompare(b.date);
            }

            const priorityOrder = {
                alta: 0,
                media: 1,
                baixa: 2
            };

            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

        if (currentFilter === "pendentes") {
            return sorted.filter(task => !task.completed);
        }

        if (currentFilter === "concluidas") {
            return sorted.filter(task => task.completed);
        }

        return sorted;
    }

    function renderTaskList(container, taskArray) {
        container.replaceChildren();

        taskArray.forEach(task => {
            container.append(createTaskElement(task));
        });
    }

    function renderTasks() {
        const filteredTasks = getFilteredTasks();

        renderTaskList(taskList, filteredTasks);
        renderTaskList(allTaskList, getFilteredTasks());

        emptyState.classList.toggle(
            "hidden",
            filteredTasks.length > 0
        );

        const isFiltered =
            currentFilter !== "todas" && tasks.length > 0;

        if (filteredTasks.length === 0 && isFiltered) {
            emptyState.querySelector("h3").textContent =
                currentFilter === "pendentes"
                    ? "Nenhuma tarefa pendente"
                    : "Nenhuma tarefa concluída";

            emptyState.querySelector("p").textContent =
                "Experimente selecionar outro filtro.";
        } else {
            emptyState.querySelector("h3").textContent =
                "Seu espaço está livre!";

            emptyState.querySelector("p").textContent =
                "Adicione sua primeira tarefa e comece a se organizar.";
        }

        allEmptyState.classList.toggle("hidden", tasks.length > 0);

        updateStatistics();
    }

    function updateStatistics() {
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        const pending = total - completed;
        const progress = total === 0
            ? 0
            : Math.round((completed / total) * 100);

        document.getElementById("totalTasks").textContent = total;
        document.getElementById("pendingTasks").textContent = pending;
        document.getElementById("completedTasks").textContent = completed;
        document.getElementById("progressNumber").textContent = progress;

        document.getElementById("progressBar").style.width = `${progress}%`;
        document.getElementById("progressBar").setAttribute(
            "aria-valuenow",
            String(progress)
        );
        document.getElementById("progressBar").setAttribute(
            "aria-valuemin",
            "0"
        );
        document.getElementById("progressBar").setAttribute(
            "aria-valuemax",
            "100"
        );
    }

    function resetForm() {
        taskForm.reset();
        taskId.value = "";
        taskPriority.value = "media";
        taskDate.min = getLocalDateString();
        taskForm.classList.remove("was-validated");
        formError.textContent = "";

        [taskTitle, taskSubject, taskDate].forEach(input => {
            input.classList.remove("is-invalid");
        });

        document.getElementById("taskModalTitle").textContent = "Nova tarefa";
    }

    function openNewTaskModal() {
        resetForm();
        taskModal.show();

        setTimeout(() => taskTitle.focus(), 250);
    }

    function openEditModal(id) {
        const task = tasks.find(item => item.id === id);

        if (!task) {
            showToast("Não foi possível encontrar essa tarefa.");
            return;
        }

        resetForm();

        taskId.value = task.id;
        taskTitle.value = task.title;
        taskSubject.value = task.subject;
        taskDate.value = task.date;
        taskPriority.value = task.priority;
        taskNotes.value = task.notes || "";

        taskDate.min = task.date < today ? task.date : today;

        document.getElementById("taskModalTitle").textContent =
            "Editar tarefa";

        taskModal.show();

        setTimeout(() => taskTitle.focus(), 250);
    }

    function validateForm() {
        let valid = true;

        const title = taskTitle.value.trim();
        const subject = taskSubject.value.trim();
        const date = taskDate.value;

        taskTitle.classList.remove("is-invalid");
        taskSubject.classList.remove("is-invalid");
        taskDate.classList.remove("is-invalid");
        formError.textContent = "";

        if (title.length < 3) {
            taskTitle.classList.add("is-invalid");
            valid = false;
        }

        if (!subject) {
            taskSubject.classList.add("is-invalid");
            valid = false;
        }

        if (!date || date < taskDate.min) {
            taskDate.classList.add("is-invalid");
            valid = false;
        }

        if (!valid) {
            formError.textContent =
                "Confira os campos destacados antes de continuar.";
        }

        return valid;
    }

    taskForm.addEventListener("submit", event => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        const title = taskTitle.value.trim();
        const subject = taskSubject.value.trim();
        const date = taskDate.value;
        const priority = taskPriority.value;
        const notes = taskNotes.value.trim();
        const id = taskId.value;

        if (id) {
            const index = tasks.findIndex(task => task.id === id);

            if (index === -1) {
                showToast("A tarefa não foi encontrada.");
                return;
            }

            tasks[index] = {
                ...tasks[index],
                title,
                subject,
                date,
                priority,
                notes
            };

            if (!saveTasks()) {
                tasks = loadTasks();
                renderTasks();
                return;
            }

            renderTasks();
            taskModal.hide();
            showToast("Tarefa atualizada com sucesso!");
            return;
        }

        const newTask = {
            id: crypto.randomUUID
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            title,
            subject,
            date,
            priority,
            notes,
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.push(newTask);

        if (!saveTasks()) {
            tasks = loadTasks();
            renderTasks();
            return;
        }

        currentFilter = "todas";

        document.querySelectorAll(".filter-btn").forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.filter === "todas"
            );
        });

        renderTasks();
        taskModal.hide();
        showToast("Tarefa cadastrada com sucesso!");
    });

    function toggleTask(id) {
        const task = tasks.find(item => item.id === id);

        if (!task) {
            return;
        }

        task.completed = !task.completed;

        if (!saveTasks()) {
            tasks = loadTasks();
            renderTasks();
            return;
        }

        renderTasks();

        showToast(
            task.completed
                ? "Parabéns! Tarefa concluída."
                : "Tarefa marcada como pendente."
        );
    }

    function deleteTask(id) {
        const task = tasks.find(item => item.id === id);

        if (!task) {
            return;
        }

        const confirmed = window.confirm(
            `Deseja realmente excluir a tarefa "${task.title}"?`
        );

        if (!confirmed) {
            return;
        }

        const previousTasks = [...tasks];

        tasks = tasks.filter(item => item.id !== id);

        if (!saveTasks()) {
            tasks = previousTasks;
            renderTasks();
            return;
        }

        renderTasks();
        showToast("Tarefa excluída.");
    }

    document.querySelectorAll(".filter-btn").forEach(button => {
        button.addEventListener("click", () => {
            currentFilter = button.dataset.filter;

            document.querySelectorAll(".filter-btn").forEach(item => {
                item.classList.toggle("active", item === button);
            });

            renderTasks();
        });
    });

    document.getElementById("newTaskTop").addEventListener(
        "click",
        openNewTaskModal
    );

    document.getElementById("emptyAddTask").addEventListener(
        "click",
        openNewTaskModal
    );

    document.getElementById("newTaskPage").addEventListener(
        "click",
        openNewTaskModal
    );

    document.getElementById("viewAllTasks").addEventListener(
        "click",
        () => navigateTo("tarefas")
    );

    document.getElementById("menuToggle").addEventListener("click", () => {
        document.getElementById("sidebar").classList.toggle("open");
    });

    function navigateTo(view) {
        currentView = view;

        const isTasksPage = view === "tarefas";

        document.getElementById("inicio").classList.toggle(
            "hidden",
            isTasksPage
        );

        document.getElementById("taskPage").classList.toggle(
            "hidden",
            !isTasksPage
        );

        document.getElementById("breadcrumbPage").textContent =
            isTasksPage ? "Minhas tarefas" : "Visão geral";

        document.querySelectorAll(".nav-link").forEach(link => {
            link.classList.toggle(
                "active",
                link.dataset.view === view ||
                (view === "foco" && link.dataset.view === "inicio")
            );
        });

        document.getElementById("sidebar").classList.remove("open");

        if (isTasksPage) {
            renderTasks();
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();

            const view = link.dataset.view;

            if (view === "tarefas") {
                navigateTo("tarefas");
            } else {
                navigateTo("inicio");

                if (view === "foco") {
                    document.getElementById("foco").scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                }
            }
        });
    });

    taskModalElement.addEventListener("hidden.bs.modal", resetForm);

    function renderTimer() {
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;

        timerDisplay.textContent =
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

        const totalSeconds = selectedMinutes * 60;
        const elapsed = totalSeconds - remainingSeconds;
        const degrees = totalSeconds > 0
            ? (elapsed / totalSeconds) * 360
            : 0;

        timerCircle.style.background =
            `conic-gradient(var(--primary) ${degrees}deg, #254059 ${degrees}deg)`;

        startTimerButton.textContent = timerRunning
            ? "Ⅱ Pausar foco"
            : "▶ Iniciar foco";
    }

    function stopTimer() {
        if (timerInterval !== null) {
            clearInterval(timerInterval);
        }

        timerInterval = null;
        timerRunning = false;
        timerEndTime = null;
    }

    function completeTimer() {
        stopTimer();
        remainingSeconds = 0;
        renderTimer();

        startTimerButton.textContent = "✓ Tempo concluído";
        showToast("Tempo encerrado! Hora de avaliar seu progresso.");

        timerLabel.textContent = "TEMPO CONCLUÍDO";
    }

    function startTimer() {
        if (timerRunning) {
            const remaining = Math.max(
                0,
                Math.ceil((timerEndTime - Date.now()) / 1000)
            );

            remainingSeconds = remaining;
            stopTimer();
            renderTimer();
            return;
        }

        if (remainingSeconds <= 0) {
            remainingSeconds = selectedMinutes * 60;
        }

        timerRunning = true;
        timerEndTime = Date.now() + remainingSeconds * 1000;
        timerLabel.textContent = "MANTENHA O FOCO";

        timerInterval = setInterval(() => {
            remainingSeconds = Math.max(
                0,
                Math.ceil((timerEndTime - Date.now()) / 1000)
            );

            renderTimer();

            if (remainingSeconds <= 0) {
                completeTimer();
            }
        }, 250);

        renderTimer();
    }

    startTimerButton.addEventListener("click", () => {
        if (remainingSeconds === 0 && !timerRunning) {
            remainingSeconds = selectedMinutes * 60;
        }

        startTimer();
    });

    document.getElementById("resetTimer").addEventListener("click", () => {
        stopTimer();
        remainingSeconds = selectedMinutes * 60;
        timerLabel.textContent = "HORA DE FOCAR";
        renderTimer();
    });

    document.querySelectorAll(".timer-tab").forEach(button => {
        button.addEventListener("click", () => {
            stopTimer();

            selectedMinutes = Number(button.dataset.minutes);
            remainingSeconds = selectedMinutes * 60;

            document.querySelectorAll(".timer-tab").forEach(tab => {
                tab.classList.toggle("active", tab === button);
            });

            timerLabel.textContent = selectedMinutes === 25
                ? "HORA DE FOCAR"
                : "MOMENTO DE PAUSA";

            renderTimer();
        });
    });

    renderTasks();
    renderTimer();
});
