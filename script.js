     const storageKey = "taski-tasks";
        const form = document.getElementById("taskForm");
        const input = document.getElementById("taskInput");
        const dateInput = document.getElementById("taskDate");
        const taskList = document.getElementById("taskList");
        const emptyState = document.getElementById("emptyState");
        const taskCount = document.getElementById("taskCount");

        const tasks = loadTasks();

        renderTasks();

        form.addEventListener("submit", function (event) {
            event.preventDefault();

            const taskName = input.value.trim();
            const taskDate = dateInput.value;

            if (!taskName) {
                input.focus();
                return;
            }

            tasks.unshift({
                id: crypto.randomUUID(),
                name: taskName,
                dueDate: taskDate,
                completed: false
            });

            saveTasks();
            renderTasks();
            form.reset();
            input.focus();
        });

        taskList.addEventListener("click", function (event) {
            const button = event.target.closest("button[data-action]");

            if (!button) {
                return;
            }

            const taskId = button.dataset.taskId;

            if (button.dataset.action === "finish") {
                toggleTaskCompletion(taskId);
                return;
            }

            if (button.dataset.action === "remove") {
                removeTask(taskId);
            }
        });

        function loadTasks() {
            const savedTasks = localStorage.getItem(storageKey);

            if (!savedTasks) {
                return [];
            }

            try {
                const parsedTasks = JSON.parse(savedTasks);
                return Array.isArray(parsedTasks) ? parsedTasks.map(normalizeTask).filter(Boolean) : [];
            } catch (error) {
                console.error("Could not read saved tasks", error);
                return [];
            }
        }

        function saveTasks() {
            localStorage.setItem(storageKey, JSON.stringify(tasks));
        }

        function renderTasks() {
            taskList.innerHTML = "";

            if (tasks.length === 0) {
                emptyState.hidden = false;
                taskCount.textContent = "0 tasks";
                return;
            }

            emptyState.hidden = true;
            taskCount.textContent = tasks.length === 1 ? "1 task" : tasks.length + " tasks";

            tasks.forEach(function (task) {
                const listItem = document.createElement("li");
                listItem.className = "task-card";
                listItem.dataset.taskId = task.id;

                if (task.completed) {
                    listItem.classList.add("is-complete");
                }

                const details = document.createElement("div");
                details.className = "task-details";

                const title = document.createElement("p");
                title.className = "task-title";
                title.textContent = task.name;

                details.appendChild(title);

                if (task.dueDate) {
                    const dueDate = document.createElement("p");
                    dueDate.className = "task-date";
                    dueDate.textContent = "Due " + formatTaskDate(task.dueDate);
                    details.appendChild(dueDate);
                }

                const actions = document.createElement("div");
                actions.className = "task-actions";

                const finishButton = document.createElement("button");
                finishButton.type = "button";
                finishButton.className = "task-action task-finish";
                finishButton.dataset.action = "finish";
                finishButton.dataset.taskId = task.id;
                finishButton.textContent = task.completed ? "Undo" : "Finish";

                const removeButton = document.createElement("button");
                removeButton.type = "button";
                removeButton.className = "task-action task-remove";
                removeButton.dataset.action = "remove";
                removeButton.dataset.taskId = task.id;
                removeButton.textContent = "Remove";

                actions.appendChild(finishButton);
                actions.appendChild(removeButton);

                listItem.appendChild(details);
                listItem.appendChild(actions);
                taskList.appendChild(listItem);
            });
        }

        function toggleTaskCompletion(taskId) {
            const task = tasks.find(function (item) {
                return item.id === taskId;
            });

            if (!task) {
                return;
            }

            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        }

        function removeTask(taskId) {
            const taskIndex = tasks.findIndex(function (item) {
                return item.id === taskId;
            });

            if (taskIndex === -1) {
                return;
            }

            tasks.splice(taskIndex, 1);
            saveTasks();
            renderTasks();
        }

        function normalizeTask(task) {
            if (!task || typeof task.name !== "string" || !task.name.trim()) {
                return null;
            }

            return {
                id: typeof task.id === "string" && task.id ? task.id : crypto.randomUUID(),
                name: task.name.trim(),
                dueDate: typeof task.dueDate === "string" ? task.dueDate : "",
                completed: Boolean(task.completed)
            };
        }

        function formatTaskDate(value) {
            const date = new Date(value);

            if (Number.isNaN(date.getTime())) {
                return value;
            }

            return new Intl.DateTimeFormat("en-US", {
                dateStyle: "medium",
                timeStyle: "short"
            }).format(date);
        }