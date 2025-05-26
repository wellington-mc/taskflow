/**
 * Storage.js
 * 
 * Responsável por gerenciar o armazenamento local de tarefas
 * utilizando o localStorage do navegador
 */

const TaskStorage = {
    /**
     * Chave utilizada para armazenar as tarefas no localStorage
     */
    STORAGE_KEY: 'taskflow_tasks',
    
    /**
     * Recupera todas as tarefas armazenadas
     * @returns {Array} Lista de tarefas ou array vazio se não houver tarefas
     */
    getTasks() {
        const tasksJson = localStorage.getItem(this.STORAGE_KEY);
        return tasksJson ? JSON.parse(tasksJson) : [];
    },
    
    /**
     * Salva a lista de tarefas no localStorage
     * @param {Array} tasks - Lista de tarefas para salvar
     */
    saveTasks(tasks) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
    },
    
    /**
     * Adiciona uma nova tarefa ou atualiza uma existente
     * @param {Object} task - Tarefa a ser adicionada/atualizada
     * @returns {Object} A tarefa adicionada/atualizada
     */
    saveTask(task) {
        const tasks = this.getTasks();
        
        // Se a tarefa não tem ID, cria um novo
        if (!task.id) {
            task.id = this.generateId();
            task.createdAt = new Date().toISOString();
            tasks.push(task);
        } else {
            // Se já tem ID, atualiza a tarefa existente
            const index = tasks.findIndex(t => t.id === task.id);
            if (index !== -1) {
                task.updatedAt = new Date().toISOString();
                tasks[index] = { ...tasks[index], ...task };
            } else {
                task.createdAt = new Date().toISOString();
                tasks.push(task);
            }
        }
        
        this.saveTasks(tasks);
        return task;
    },
    
    /**
     * Remove uma tarefa pelo ID
     * @param {String} id - ID da tarefa a ser removida
     * @returns {Boolean} true se a tarefa foi removida, false caso contrário
     */
    deleteTask(id) {
        const tasks = this.getTasks();
        const newTasks = tasks.filter(task => task.id !== id);
        
        if (newTasks.length !== tasks.length) {
            this.saveTasks(newTasks);
            return true;
        }
        
        return false;
    },
    
    /**
     * Busca uma tarefa pelo ID
     * @param {String} id - ID da tarefa a ser buscada
     * @returns {Object|null} A tarefa encontrada ou null se não encontrada
     */
    getTaskById(id) {
        const tasks = this.getTasks();
        return tasks.find(task => task.id === id) || null;
    },
    
    /**
     * Gera um ID único para uma nova tarefa
     * @returns {String} ID único no formato de timestamp + número aleatório
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },
    
    /**
     * Retorna estatísticas sobre as tarefas
     * @returns {Object} Objeto com estatísticas (total, pendentes, em progresso, concluídas, atrasadas)
     */
    getTaskStats() {
        const tasks = this.getTasks();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const stats = {
            total: tasks.length,
            pendentes: 0,
            emProgresso: 0,
            concluidas: 0,
            atrasadas: 0
        };
        
        tasks.forEach(task => {
            // Contagem por status
            if (task.status === 'pendente') stats.pendentes++;
            else if (task.status === 'em-progresso') stats.emProgresso++;
            else if (task.status === 'concluida') stats.concluidas++;
            
            // Verificar tarefas atrasadas (não concluídas e com prazo vencido)
            if (task.status !== 'concluida') {
                const dueDate = new Date(task.dueDate);
                dueDate.setHours(23, 59, 59, 999);
                if (dueDate < today) {
                    stats.atrasadas++;
                }
            }
        });
        
        return stats;
    },
    
    /**
     * Busca tarefas por termo de pesquisa
     * @param {String} searchTerm - Termo para buscar nas tarefas
     * @returns {Array} Lista de tarefas que correspondem ao termo de busca
     */
    searchTasks(searchTerm) {
        if (!searchTerm.trim()) return this.getTasks();
        
        const tasks = this.getTasks();
        const term = searchTerm.toLowerCase();
        
        return tasks.filter(task => 
            task.title.toLowerCase().includes(term) || 
            (task.description && task.description.toLowerCase().includes(term))
        );
    },
    
    /**
     * Retorna tarefas agrupadas por categoria
     * @returns {Object} Objeto com categorias como chaves e contagens como valores
     */
    getTasksByCategory() {
        const tasks = this.getTasks();
        const categories = {};
        
        tasks.forEach(task => {
            if (!categories[task.category]) {
                categories[task.category] = 0;
            }
            categories[task.category]++;
        });
        
        return categories;
    },
    
    /**
     * Carrega dados de exemplo se não houver tarefas
     */
    loadSampleData() {
        const tasks = this.getTasks();
        
        if (tasks.length === 0) {
            const sampleTasks = [
                {
                    id: 'sample1',
                    title: 'Concluir projeto de dashboard',
                    description: 'Finalizar o desenvolvimento do dashboard com todas as funcionalidades planejadas.',
                    category: 'trabalho',
                    status: 'em-progresso',
                    priority: 'alta',
                    dueDate: this.getFutureDate(2),
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'sample2',
                    title: 'Estudar JavaScript avançado',
                    description: 'Estudar tópicos avançados de JavaScript: promises, async/await, módulos e closures.',
                    category: 'estudo',
                    status: 'pendente',
                    priority: 'media',
                    dueDate: this.getFutureDate(5),
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'sample3',
                    title: 'Academia',
                    description: 'Ir à academia por pelo menos 1 hora.',
                    category: 'saude',
                    status: 'concluida',
                    priority: 'media',
                    dueDate: this.getFutureDate(-1),
                    createdAt: new Date().toISOString(),
                    completedAt: new Date().toISOString()
                },
                {
                    id: 'sample4',
                    title: 'Pagar conta de luz',
                    description: 'Pagar a conta antes do vencimento para evitar multa.',
                    category: 'financas',
                    status: 'pendente',
                    priority: 'alta',
                    dueDate: this.getFutureDate(1),
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'sample5',
                    title: 'Reunião com equipe',
                    description: 'Discutir os próximos passos do projeto e distribuir tarefas.',
                    category: 'trabalho',
                    status: 'pendente',
                    priority: 'media',
                    dueDate: this.getFutureDate(3),
                    createdAt: new Date().toISOString()
                }
            ];
            
            this.saveTasks(sampleTasks);
        }
    },
    
    /**
     * Retorna uma data futura a partir de hoje
     * @param {Number} days - Número de dias no futuro (ou negativo para o passado)
     * @returns {String} Data formatada como string YYYY-MM-DD
     */
    getFutureDate(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    }
};
