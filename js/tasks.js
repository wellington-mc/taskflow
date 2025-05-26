/**
 * Tasks.js
 * 
 * Responsável por gerenciar as operações relacionadas às tarefas
 * como adicionar, editar, excluir e exibir tarefas
 */

const TaskManager = {
    /**
     * Inicializa o gerenciador de tarefas
     */
    init() {
        // Elementos da interface
        this.tasksList = document.getElementById('tasks-list');
        this.emptyTasksEl = document.getElementById('empty-tasks');
        this.taskModal = document.getElementById('task-modal');
        this.taskForm = document.getElementById('task-form');
        this.modalTitle = document.getElementById('modal-title');
        this.taskIdInput = document.getElementById('task-id');
        this.taskTitleInput = document.getElementById('task-title');
        this.taskDescriptionInput = document.getElementById('task-description');
        this.taskCategoryInput = document.getElementById('task-category');
        this.taskPriorityInput = document.getElementById('task-priority');
        this.taskDueDateInput = document.getElementById('task-due-date');
        this.taskStatusInput = document.getElementById('task-status');
        this.searchInput = document.getElementById('search-tasks');
        
        // Botões
        this.addTaskBtn = document.getElementById('add-task-btn');
        this.addTaskBtnAll = document.getElementById('add-task-btn-all');
        this.addTaskCalendarBtn = document.getElementById('add-task-calendar');
        this.closeModalBtn = document.getElementById('close-modal');
        this.cancelTaskBtn = document.getElementById('cancel-task');
        
        // Definições e configurações
        const today = new Date().toISOString().split('T')[0];
        if (this.taskDueDateInput) {
            this.taskDueDateInput.min = today;
        }
        
        // Conectar todos os botões de "Nova Tarefa" ao modal
        this.setupAddTaskButtons();
        
        // Eventos
        if (this.closeModalBtn) {
            this.closeModalBtn.addEventListener('click', () => this.closeTaskModal());
        }
        if (this.cancelTaskBtn) {
            this.cancelTaskBtn.addEventListener('click', () => this.closeTaskModal());
        }
        if (this.taskForm) {
            this.taskForm.addEventListener('submit', (e) => this.handleTaskSubmit(e));
        }
        
        // Configurar busca em todos os campos de busca
        this.setupSearchFunctionality();
        
        // Adicionar evento de tecla Enter para busca
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && document.activeElement === this.searchInput) {
                this.handleSearch();
            }
        });
        
        // Carregar tarefas
        this.loadTasks();
        
        // Carregar dados de exemplo se não houver tarefas
        TaskStorage.loadSampleData();
    },
    
    /**
     * Configura a funcionalidade de busca em todos os campos
     */
    setupSearchFunctionality() {
        // Obter todos os campos de busca
        const searchInputs = [
            document.getElementById('search-tasks'),          // Barra de busca principal
            document.getElementById('search-tasks-all')      // Busca na página "Todas as Tarefas"
        ];
        
        // Adicionar evento de input para cada campo
        searchInputs.forEach(input => {
            if (input) {
                // Remover eventos anteriores para evitar duplicação
                input.removeEventListener('input', () => this.handleSearch.bind(this));
                
                // Adicionar novo evento
                input.addEventListener('input', () => {
                    // Atualizar o valor do campo de busca principal para manter sincronizado
                    this.searchInput = input;
                    this.handleSearch();
                });
            }
        });
    },
    
    /**
     * Carrega as tarefas do armazenamento e exibe na interface
     */
    loadTasks() {
        const tasks = TaskStorage.getTasks();
        this.renderTasks(tasks);
        this.updateTasksCounter();
    },
    
    /**
     * Renderiza as tarefas na tabela
     * @param {Array} tasks - Lista de tarefas a serem renderizadas
     */
    renderTasks(tasks) {
        this.tasksList.innerHTML = '';
        
        // Mostrar mensagem de nenhuma tarefa se não houver tarefas
        if (tasks.length === 0) {
            this.emptyTasksEl.classList.remove('hidden');
            return;
        }
        
        this.emptyTasksEl.classList.add('hidden');
        
        // Ordenar tarefas: primeiro não concluídas, depois por data de vencimento
        const sortedTasks = [...tasks].sort((a, b) => {
            if (a.status === 'concluida' && b.status !== 'concluida') return 1;
            if (a.status !== 'concluida' && b.status === 'concluida') return -1;
            
            const dateA = new Date(a.dueDate);
            const dateB = new Date(b.dueDate);
            return dateA - dateB;
        });
        
        // Criar linhas da tabela para cada tarefa
        sortedTasks.forEach(task => {
            const row = document.createElement('tr');
            
            // Definir classe para tarefas concluídas
            if (task.status === 'concluida') {
                row.classList.add('completed-task');
            }
            
            // Formatar data de vencimento
            const dueDate = new Date(task.dueDate);
            const formattedDate = dueDate.toLocaleDateString('pt-BR');
            
            // Verificar se está atrasada
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isOverdue = task.status !== 'concluida' && dueDate < today;
            
            row.innerHTML = `
                <td>
                    <div class="task-title">
                        ${task.title}
                    </div>
                </td>
                <td>
                    <span class="category-badge ${task.category}">
                        ${this.getCategoryLabel(task.category)}
                    </span>
                </td>
                <td>
                    <span class="${isOverdue ? 'overdue-date' : ''}">
                        ${formattedDate}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${task.status}">
                        ${this.getStatusLabel(task.status)}
                    </span>
                </td>
                <td>
                    <span class="priority-display">
                        <span class="priority-badge ${task.priority}"></span>
                        ${this.getPriorityLabel(task.priority)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-button edit" title="Editar" onclick="TaskManager.editTask('${task.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-button delete" title="Excluir" onclick="TaskManager.deleteTask('${task.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            this.tasksList.appendChild(row);
        });
    },
    
    /**
     * Configura os botões de adicionar tarefa em todas as páginas
     */
    setupAddTaskButtons() {
        // Array com todos os seletores de botões "Nova Tarefa"
        const addTaskButtons = [
            'add-task-btn',        // Dashboard
            'add-task-btn-all',    // Página Todas as Tarefas
            'add-task-calendar'    // Página Calendário
        ];
        
        // Para cada seletor, procurar o botão e adicionar evento de clique
        addTaskButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', () => this.openTaskModal());
            }
        });
    },
    
    /**
     * Carrega todas as tarefas para a visualização completa
     */
    loadAllTasks() {
        const allTasksList = document.getElementById('all-tasks-list');
        const emptyAllTasks = document.getElementById('empty-all-tasks');
        
        if (!allTasksList || !emptyAllTasks) return;
        
        const tasks = TaskStorage.getTasks();
        
        if (tasks.length === 0) {
            allTasksList.innerHTML = '';
            emptyAllTasks.classList.remove('hidden');
            return;
        }
        
        emptyAllTasks.classList.add('hidden');
        allTasksList.innerHTML = '';
        
        // Renderizar cada tarefa na tabela
        tasks.forEach(task => {
            const row = document.createElement('tr');
            
            // Formatar data de vencimento
            const dueDate = new Date(task.dueDate);
            const formattedDate = dueDate.toLocaleDateString('pt-BR');
            
            // Verificar se está atrasada
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isOverdue = task.status !== 'concluida' && dueDate < today;
            
            row.innerHTML = `
                <td>${task.title}</td>
                <td>${task.description || '-'}</td>
                <td>
                    <span class="category-badge ${task.category}">
                        ${this.getCategoryLabel(task.category)}
                    </span>
                </td>
                <td>
                    <span class="${isOverdue ? 'overdue-date' : ''}">
                        ${formattedDate}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${task.status}">
                        ${this.getStatusLabel(task.status)}
                    </span>
                </td>
                <td>
                    <span class="priority-display">
                        <span class="priority-badge ${task.priority}"></span>
                        ${this.getPriorityLabel(task.priority)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-button edit" title="Editar" onclick="TaskManager.editTask('${task.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-button delete" title="Excluir" onclick="TaskManager.deleteTask('${task.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            allTasksList.appendChild(row);
        });
        
        // Configurar eventos de filtro
        this.setupAllTasksFilters();
    },
    
    /**
     * Configura os filtros na página "Todas as Tarefas"
     */
    setupAllTasksFilters() {
        const filterStatus = document.getElementById('filter-status');
        const filterCategory = document.getElementById('filter-category');
        const filterPriority = document.getElementById('filter-priority');
        const sortBy = document.getElementById('sort-by');
        const searchInput = document.getElementById('search-tasks-all');
        
        const filterElements = [filterStatus, filterCategory, filterPriority, sortBy, searchInput];
        
        // Verificar se todos os elementos existem
        if (!filterElements.every(el => el)) return;
        
        // Função para aplicar filtros
        const applyFilters = () => {
            let tasks = TaskStorage.getTasks();
            const statusFilter = filterStatus.value;
            const categoryFilter = filterCategory.value;
            const priorityFilter = filterPriority.value;
            const searchTerm = searchInput.value.toLowerCase();
            
            // Filtrar por status
            if (statusFilter !== 'all') {
                tasks = tasks.filter(task => task.status === statusFilter);
            }
            
            // Filtrar por categoria
            if (categoryFilter !== 'all') {
                tasks = tasks.filter(task => task.category === categoryFilter);
            }
            
            // Filtrar por prioridade
            if (priorityFilter !== 'all') {
                tasks = tasks.filter(task => task.priority === priorityFilter);
            }
            
            // Filtrar por termo de busca
            if (searchTerm) {
                tasks = tasks.filter(task => 
                    task.title.toLowerCase().includes(searchTerm) || 
                    (task.description && task.description.toLowerCase().includes(searchTerm))
                );
            }
            
            // Ordenar
            const sortField = sortBy.value;
            tasks = [...tasks].sort((a, b) => {
                if (sortField === 'dueDate') {
                    return new Date(a.dueDate) - new Date(b.dueDate);
                } else if (sortField === 'priority') {
                    const priorityValue = { alta: 3, media: 2, baixa: 1 };
                    return priorityValue[b.priority] - priorityValue[a.priority];
                } else if (sortField === 'title') {
                    return a.title.localeCompare(b.title);
                } else if (sortField === 'category') {
                    return a.category.localeCompare(b.category);
                }
                return 0;
            });
            
            // Atualizar lista
            const allTasksList = document.getElementById('all-tasks-list');
            const emptyAllTasks = document.getElementById('empty-all-tasks');
            
            if (tasks.length === 0) {
                allTasksList.innerHTML = '';
                emptyAllTasks.classList.remove('hidden');
                return;
            }
            
            emptyAllTasks.classList.add('hidden');
            allTasksList.innerHTML = '';
            
            // Renderizar tarefas filtradas
            tasks.forEach(task => {
                const row = document.createElement('tr');
                
                // Formatar data de vencimento
                const dueDate = new Date(task.dueDate);
                const formattedDate = dueDate.toLocaleDateString('pt-BR');
                
                // Verificar se está atrasada
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isOverdue = task.status !== 'concluida' && dueDate < today;
                
                row.innerHTML = `
                    <td>${task.title}</td>
                    <td>${task.description || '-'}</td>
                    <td>
                        <span class="category-badge ${task.category}">
                            ${this.getCategoryLabel(task.category)}
                        </span>
                    </td>
                    <td>
                        <span class="${isOverdue ? 'overdue-date' : ''}">
                            ${formattedDate}
                        </span>
                    </td>
                    <td>
                        <span class="status-badge ${task.status}">
                            ${this.getStatusLabel(task.status)}
                        </span>
                    </td>
                    <td>
                        <span class="priority-display">
                            <span class="priority-badge ${task.priority}"></span>
                            ${this.getPriorityLabel(task.priority)}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-button edit" title="Editar" onclick="TaskManager.editTask('${task.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-button delete" title="Excluir" onclick="TaskManager.deleteTask('${task.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                
                allTasksList.appendChild(row);
            });
        };
        
        // Adicionar eventos
        filterStatus.addEventListener('change', applyFilters);
        filterCategory.addEventListener('change', applyFilters);
        filterPriority.addEventListener('change', applyFilters);
        sortBy.addEventListener('change', applyFilters);
        searchInput.addEventListener('input', applyFilters);
    },
    
    /**
     * Atualiza os contadores de tarefas no dashboard
     */
    updateTasksCounter() {
        const stats = TaskStorage.getTaskStats();
        
        const elements = {
            'total-tasks': stats.total,
            'in-progress': stats.emProgresso,
            'completed': stats.concluidas,
            'overdue': stats.atrasadas
        };
        
        // Atualizar cada contador se o elemento existir
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
        
        // Atualizar gráficos
        if (typeof ChartManager !== 'undefined') {
            ChartManager.updateCharts();
        }
    },
    
    /**
     * Abre o modal para adicionar uma nova tarefa
     */
    openTaskModal(taskId = null) {
        this.resetForm();
        
        if (taskId) {
            // Modo de edição
            const task = TaskStorage.getTaskById(taskId);
            if (task) {
                this.modalTitle.textContent = 'Editar Tarefa';
                this.taskIdInput.value = task.id;
                this.taskTitleInput.value = task.title;
                this.taskDescriptionInput.value = task.description || '';
                this.taskCategoryInput.value = task.category;
                this.taskPriorityInput.value = task.priority;
                this.taskDueDateInput.value = task.dueDate;
                this.taskStatusInput.value = task.status;
            }
        } else {
            // Modo de adição
            this.modalTitle.textContent = 'Nova Tarefa';
            this.taskIdInput.value = '';
            // Definir data mínima como hoje
            const today = new Date().toISOString().split('T')[0];
            this.taskDueDateInput.value = today;
        }
        
        this.taskModal.classList.add('active');
    },
    
    /**
     * Fecha o modal de tarefa
     */
    closeTaskModal() {
        this.taskModal.classList.remove('active');
        this.resetForm();
    },
    
    /**
     * Reseta o formulário para valores padrão
     */
    resetForm() {
        this.taskForm.reset();
        this.taskIdInput.value = '';
    },
    
    /**
     * Manipula o envio do formulário de tarefa
     */
    handleTaskSubmit(e) {
        e.preventDefault();
        
        // Validar formulário
        if (!this.taskForm.checkValidity()) {
            return;
        }
        
        // Obter valores do formulário
        const task = {
            id: this.taskIdInput.value,
            title: this.taskTitleInput.value,
            description: this.taskDescriptionInput.value,
            category: this.taskCategoryInput.value,
            priority: this.taskPriorityInput.value,
            dueDate: this.taskDueDateInput.value,
            status: this.taskStatusInput.value
        };
        
        // Salvar tarefa
        TaskStorage.saveTask(task);
        
        // Fechar modal
        this.closeTaskModal();
        
        // Recarregar tarefas
        this.loadTasks();
    },
    
    /**
     * Abre o modal para editar uma tarefa existente
     */
    editTask(taskId) {
        this.openTaskModal(taskId);
    },
    
    /**
     * Exclui uma tarefa
     */
    deleteTask(taskId) {
        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            TaskStorage.deleteTask(taskId);
            this.loadTasks();
        }
    },
    
    /**
     * Manipula a pesquisa de tarefas
     */
    handleSearch() {
        // Verificar se o input de busca existe
        if (!this.searchInput) return;
        
        const searchTerm = this.searchInput.value;
        console.log('Buscando por:', searchTerm);
        
        // Obter tarefas filtradas
        const filteredTasks = TaskStorage.searchTasks(searchTerm);
        
        // Renderizar tarefas filtradas
        this.renderTasks(filteredTasks);
        
        // Atualizar o contador de tarefas para refletir os resultados da busca
        document.getElementById('total-tasks').textContent = filteredTasks.length;
        
        // Verificar se não há resultados para mostrar mensagem apropriada
        if (filteredTasks.length === 0 && searchTerm.trim() !== '') {
            // Mostrar mensagem de "nenhum resultado encontrado" se não estiver visível
            if (this.emptyTasksEl) {
                this.emptyTasksEl.querySelector('h3').textContent = 'Nenhum resultado encontrado';
                this.emptyTasksEl.querySelector('p').textContent = `Não encontramos tarefas para "${searchTerm}"`;
                this.emptyTasksEl.classList.remove('hidden');
            }
        }
    },
    
    /**
     * Retorna o rótulo de uma categoria
     */
    getCategoryLabel(category) {
        const labels = {
            'trabalho': 'Trabalho',
            'pessoal': 'Pessoal',
            'estudo': 'Estudo',
            'saude': 'Saúde',
            'financas': 'Finanças'
        };
        
        return labels[category] || category;
    },
    
    /**
     * Retorna o rótulo de um status
     */
    getStatusLabel(status) {
        const labels = {
            'pendente': 'Pendente',
            'em-progresso': 'Em Progresso',
            'concluida': 'Concluída'
        };
        
        return labels[status] || status;
    },
    
    /**
     * Retorna o rótulo de uma prioridade
     */
    getPriorityLabel(priority) {
        const labels = {
            'baixa': 'Baixa',
            'media': 'Média',
            'alta': 'Alta'
        };
        
        return labels[priority] || priority;
    }
};
