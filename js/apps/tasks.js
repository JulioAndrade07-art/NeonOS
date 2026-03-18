// --- TASK SYSTEM LOGIC ---
const TasksApp = {
    tasks: [],

    init: function () {
        // Use central StorageManager
        this.tasks = window.StorageManager.load('neon_tasks', []);
        this.render();
    },

    render: function () {
        ['todo', 'doing', 'done'].forEach(status => {
            const list = document.getElementById(`list-${status}`);
            const count = document.getElementById(`count-${status}`);
            if (!list) return;

            list.innerHTML = '';
            const filtered = this.tasks.filter(t => t.status === status);
            count.textContent = filtered.length;

            filtered.forEach(t => {
                const card = document.createElement('div');
                card.className = `task-card priority-${t.priority}`;
                card.draggable = true;
                card.id = `task-${t.id}`;
                card.innerHTML = `
                    <div class="task-title">${t.title}</div>
                    <div class="task-meta">
                        <span>${new Date(t.date).toLocaleDateString()}</span>
                        <span class="delete-task" onclick="TasksApp.deleteTask(${t.id}, event)">🗑 expurgar</span>
                    </div>
                `;

                // Touch support setup
                card.addEventListener('touchstart', (e) => {
                    // prevent default to stop scrolling if needed, but might break scroll. 
                    // To keep it simple, we listen to touch events on container level for drag.
                });

                card.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', t.id);
                    setTimeout(() => card.classList.add('dragging'), 0);
                });
                card.addEventListener('dragend', () => card.classList.remove('dragging'));

                list.appendChild(card);
            });
        });
    },

    drop: function (e, status) {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        const task = this.tasks.find(t => t.id == id);
        if (task) {
            task.status = status;
            this.save();
            this.render();
        }
    },

    add: function () {
        const title = document.getElementById('task-input-title').value;
        const priority = document.getElementById('task-input-priority').value;
        if (!title) return;

        this.tasks.push({
            id: Date.now(),
            title,
            priority,
            status: 'todo',
            date: new Date()
        });

        this.save();
        this.render();
        this.closeModal();
    },

    deleteTask: function (id, e) {
        if (e) e.stopPropagation();
        if (confirm('Deletar essa tarefa?')) {
            this.tasks = this.tasks.filter(t => t.id != id);
            this.save();
            this.render();
        }
    },

    save: function () {
        window.StorageManager.save('neon_tasks', this.tasks);
    },

    showModal: function () {
        document.getElementById('task-modal').classList.remove('hidden');
        document.getElementById('task-input-title').focus();
    },

    closeModal: function () {
        document.getElementById('task-modal').classList.add('hidden');
        document.getElementById('task-input-title').value = '';
    }
};

// Global bindings
window.TasksApp = TasksApp;
window.taskAllowDrop = (e) => e.preventDefault();
window.taskDrop = (e, status) => TasksApp.drop(e, status);
window.taskShowAddModal = () => TasksApp.showModal();
window.taskCloseModal = () => TasksApp.closeModal();
window.taskAddTask = () => TasksApp.add();

// Wait for DOM
setTimeout(() => TasksApp.init(), 100);
